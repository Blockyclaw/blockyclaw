-- =====================
-- Marketplace Items (Skills, APIs, Models, etc.)
-- =====================
CREATE TYPE item_type AS ENUM ('skill', 'api', 'model', 'lora', 'prompt', 'data', 'compute', 'agent_hire');

CREATE TABLE public.marketplace_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  seller_agent_id UUID REFERENCES public.ai_agents(id), -- If sold by AI agent

  type item_type NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,

  -- Pricing (in cents USD for precision)
  price_cents INTEGER NOT NULL DEFAULT 0,

  -- Content (depends on type)
  content_url TEXT, -- S3/R2 URL for downloadable
  content_md TEXT, -- For skill.md type content
  api_endpoint TEXT, -- For API type
  model_url TEXT, -- For model/lora type

  -- Metadata
  version TEXT DEFAULT '1.0.0',
  tags TEXT[] DEFAULT '{}',

  -- Stats
  download_count INTEGER DEFAULT 0,
  rating_avg NUMERIC(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,

  -- Status
  is_published BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE, -- Platform verified

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_items_type ON public.marketplace_items(type);
CREATE INDEX idx_items_seller ON public.marketplace_items(seller_id);
CREATE INDEX idx_items_published ON public.marketplace_items(is_published);

-- =====================
-- Fee Configuration
-- =====================
CREATE TABLE public.fee_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,

  -- Fee percentages (basis points, 100 = 1%)
  deposit_fee_bps INTEGER DEFAULT 150, -- 1.5%
  withdrawal_fee_bps INTEGER DEFAULT 200, -- 2%

  -- Transaction fees by type
  skill_fee_bps INTEGER DEFAULT 1500, -- 15%
  api_fee_bps INTEGER DEFAULT 1200, -- 12%
  model_fee_bps INTEGER DEFAULT 2000, -- 20%
  lora_fee_bps INTEGER DEFAULT 2000, -- 20%
  prompt_fee_bps INTEGER DEFAULT 1500, -- 15%
  data_fee_bps INTEGER DEFAULT 1000, -- 10%
  compute_fee_bps INTEGER DEFAULT 500, -- 5%
  agent_hire_fee_bps INTEGER DEFAULT 2500, -- 25%

  -- API usage fees (cents per 1000 calls)
  api_overage_cents INTEGER DEFAULT 100, -- $1 per 1000

  -- Minimum fees (cents)
  min_transaction_fee_cents INTEGER DEFAULT 50, -- $0.50 minimum

  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default fee config
INSERT INTO public.fee_config (name) VALUES ('default');

-- =====================
-- Platform Revenue Tracking
-- =====================
CREATE TYPE revenue_type AS ENUM (
  'deposit_fee',
  'withdrawal_fee',
  'transaction_fee',
  'api_overage',
  'subscription',
  'featured_listing'
);

CREATE TABLE public.platform_revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type revenue_type NOT NULL,
  amount_cents INTEGER NOT NULL,

  -- References
  transaction_id UUID,
  agent_id UUID REFERENCES public.ai_agents(id),
  user_id UUID REFERENCES public.users(id),
  item_id UUID REFERENCES public.marketplace_items(id),

  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_revenue_type ON public.platform_revenue(type);
CREATE INDEX idx_revenue_date ON public.platform_revenue(created_at);

-- =====================
-- Wallet Transactions (Updated for USD cents)
-- =====================
ALTER TABLE public.ai_wallet_transactions
  ADD COLUMN IF NOT EXISTS amount_cents INTEGER,
  ADD COLUMN IF NOT EXISTS fee_cents INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fee_type TEXT;

-- =====================
-- Item Ownership (who owns what)
-- =====================
CREATE TABLE public.item_ownership (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Owner can be agent or user
  agent_id UUID REFERENCES public.ai_agents(id),
  user_id UUID REFERENCES public.users(id),

  item_id UUID NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,

  -- Purchase info
  purchase_price_cents INTEGER NOT NULL,
  fee_paid_cents INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),

  -- Usage
  use_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  CONSTRAINT ownership_check CHECK (agent_id IS NOT NULL OR user_id IS NOT NULL)
);

CREATE INDEX idx_ownership_agent ON public.item_ownership(agent_id);
CREATE INDEX idx_ownership_user ON public.item_ownership(user_id);
CREATE UNIQUE INDEX idx_ownership_unique ON public.item_ownership(COALESCE(agent_id, '00000000-0000-0000-0000-000000000000'), COALESCE(user_id, '00000000-0000-0000-0000-000000000000'), item_id);

-- =====================
-- Functions
-- =====================

-- Get fee for item type
CREATE OR REPLACE FUNCTION get_fee_bps(p_item_type item_type)
RETURNS INTEGER AS $$
DECLARE
  v_config RECORD;
BEGIN
  SELECT * INTO v_config FROM public.fee_config WHERE is_active = TRUE LIMIT 1;

  RETURN CASE p_item_type
    WHEN 'skill' THEN v_config.skill_fee_bps
    WHEN 'api' THEN v_config.api_fee_bps
    WHEN 'model' THEN v_config.model_fee_bps
    WHEN 'lora' THEN v_config.lora_fee_bps
    WHEN 'prompt' THEN v_config.prompt_fee_bps
    WHEN 'data' THEN v_config.data_fee_bps
    WHEN 'compute' THEN v_config.compute_fee_bps
    WHEN 'agent_hire' THEN v_config.agent_hire_fee_bps
    ELSE 1500 -- Default 15%
  END;
END;
$$ LANGUAGE plpgsql;

-- Process marketplace purchase with fees
CREATE OR REPLACE FUNCTION process_marketplace_purchase(
  p_buyer_agent_id UUID,
  p_item_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_agent RECORD;
  v_item RECORD;
  v_fee_bps INTEGER;
  v_fee_cents INTEGER;
  v_min_fee INTEGER;
  v_net_to_seller INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get buyer agent
  SELECT * INTO v_agent FROM public.ai_agents WHERE id = p_buyer_agent_id AND is_active = TRUE;
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Agent not found or inactive');
  END IF;

  -- Get item
  SELECT * INTO v_item FROM public.marketplace_items WHERE id = p_item_id AND is_published = TRUE;
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Item not found');
  END IF;

  -- Check if already owned
  IF EXISTS (SELECT 1 FROM public.item_ownership WHERE agent_id = p_buyer_agent_id AND item_id = p_item_id) THEN
    RETURN json_build_object('error', 'Already owned');
  END IF;

  -- Check balance
  IF v_agent.balance < v_item.price_cents THEN
    RETURN json_build_object('error', 'Insufficient balance', 'required', v_item.price_cents, 'available', v_agent.balance);
  END IF;

  -- Calculate fee
  v_fee_bps := get_fee_bps(v_item.type);
  v_fee_cents := (v_item.price_cents * v_fee_bps) / 10000;

  -- Apply minimum fee
  SELECT min_transaction_fee_cents INTO v_min_fee FROM public.fee_config WHERE is_active = TRUE LIMIT 1;
  IF v_fee_cents < v_min_fee THEN
    v_fee_cents := v_min_fee;
  END IF;

  v_net_to_seller := v_item.price_cents - v_fee_cents;

  -- Deduct from buyer
  v_new_balance := v_agent.balance - v_item.price_cents;
  UPDATE public.ai_agents
  SET balance = v_new_balance,
      lifetime_spent = lifetime_spent + v_item.price_cents,
      total_purchases = total_purchases + 1,
      last_active_at = NOW()
  WHERE id = p_buyer_agent_id;

  -- Credit seller (if agent)
  IF v_item.seller_agent_id IS NOT NULL THEN
    UPDATE public.ai_agents
    SET balance = balance + v_net_to_seller
    WHERE id = v_item.seller_agent_id;
  END IF;

  -- Record buyer transaction
  INSERT INTO public.ai_wallet_transactions (
    agent_id, type, amount, amount_cents, fee_cents, fee_type, balance_after, description
  )
  VALUES (
    p_buyer_agent_id, 'purchase', -v_item.price_cents, -v_item.price_cents, 0, NULL, v_new_balance,
    'Purchase: ' || v_item.title
  );

  -- Record platform revenue
  INSERT INTO public.platform_revenue (type, amount_cents, agent_id, item_id, description)
  VALUES ('transaction_fee', v_fee_cents, p_buyer_agent_id, p_item_id,
          v_item.type || ' purchase fee: ' || v_item.title);

  -- Grant ownership
  INSERT INTO public.item_ownership (agent_id, item_id, purchase_price_cents, fee_paid_cents)
  VALUES (p_buyer_agent_id, p_item_id, v_item.price_cents, v_fee_cents);

  -- Also grant to owner (human)
  INSERT INTO public.item_ownership (user_id, item_id, purchase_price_cents, fee_paid_cents)
  VALUES (v_agent.owner_id, p_item_id, v_item.price_cents, v_fee_cents)
  ON CONFLICT DO NOTHING;

  -- Update download count
  UPDATE public.marketplace_items SET download_count = download_count + 1 WHERE id = p_item_id;

  RETURN json_build_object(
    'status', 'success',
    'item_title', v_item.title,
    'item_type', v_item.type,
    'price_cents', v_item.price_cents,
    'fee_cents', v_fee_cents,
    'fee_percent', (v_fee_bps::FLOAT / 100),
    'net_to_seller', v_net_to_seller,
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Process deposit with fee
CREATE OR REPLACE FUNCTION process_deposit(
  p_agent_id UUID,
  p_amount_cents INTEGER,
  p_payment_method TEXT DEFAULT 'stripe'
)
RETURNS JSON AS $$
DECLARE
  v_fee_bps INTEGER;
  v_fee_cents INTEGER;
  v_net_amount INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get deposit fee
  SELECT deposit_fee_bps INTO v_fee_bps FROM public.fee_config WHERE is_active = TRUE LIMIT 1;

  -- Stripe has additional fees
  IF p_payment_method = 'stripe' THEN
    v_fee_bps := v_fee_bps + 140; -- +1.4% for Stripe (we pass it on)
  END IF;

  v_fee_cents := (p_amount_cents * v_fee_bps) / 10000;
  v_net_amount := p_amount_cents - v_fee_cents;

  -- Credit agent
  UPDATE public.ai_agents
  SET balance = balance + v_net_amount
  WHERE id = p_agent_id
  RETURNING balance INTO v_new_balance;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Agent not found');
  END IF;

  -- Record transaction
  INSERT INTO public.ai_wallet_transactions (
    agent_id, type, amount, amount_cents, fee_cents, fee_type, balance_after, description
  )
  VALUES (
    p_agent_id, 'deposit', v_net_amount, v_net_amount, v_fee_cents, 'deposit_fee', v_new_balance,
    'Deposit via ' || p_payment_method
  );

  -- Record revenue
  INSERT INTO public.platform_revenue (type, amount_cents, agent_id, description)
  VALUES ('deposit_fee', v_fee_cents, p_agent_id, 'Deposit fee via ' || p_payment_method);

  RETURN json_build_object(
    'status', 'success',
    'gross_amount', p_amount_cents,
    'fee_cents', v_fee_cents,
    'net_credited', v_net_amount,
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Process withdrawal with fee
CREATE OR REPLACE FUNCTION process_withdrawal(
  p_agent_id UUID,
  p_amount_cents INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_agent RECORD;
  v_fee_bps INTEGER;
  v_fee_cents INTEGER;
  v_net_amount INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get agent
  SELECT * INTO v_agent FROM public.ai_agents WHERE id = p_agent_id;
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Agent not found');
  END IF;

  -- Check balance
  IF v_agent.balance < p_amount_cents THEN
    RETURN json_build_object('error', 'Insufficient balance');
  END IF;

  -- Get withdrawal fee
  SELECT withdrawal_fee_bps INTO v_fee_bps FROM public.fee_config WHERE is_active = TRUE LIMIT 1;
  v_fee_cents := (p_amount_cents * v_fee_bps) / 10000;
  v_net_amount := p_amount_cents - v_fee_cents;

  -- Deduct from agent
  v_new_balance := v_agent.balance - p_amount_cents;
  UPDATE public.ai_agents SET balance = v_new_balance WHERE id = p_agent_id;

  -- Record transaction
  INSERT INTO public.ai_wallet_transactions (
    agent_id, type, amount, amount_cents, fee_cents, fee_type, balance_after, description
  )
  VALUES (
    p_agent_id, 'withdrawal', -p_amount_cents, -p_amount_cents, v_fee_cents, 'withdrawal_fee', v_new_balance,
    'Withdrawal'
  );

  -- Record revenue
  INSERT INTO public.platform_revenue (type, amount_cents, agent_id, description)
  VALUES ('withdrawal_fee', v_fee_cents, p_agent_id, 'Withdrawal fee');

  RETURN json_build_object(
    'status', 'success',
    'gross_amount', p_amount_cents,
    'fee_cents', v_fee_cents,
    'net_payout', v_net_amount,
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get platform revenue summary
CREATE OR REPLACE FUNCTION get_revenue_summary(p_days INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
  v_total INTEGER;
  v_by_type JSON;
BEGIN
  SELECT COALESCE(SUM(amount_cents), 0) INTO v_total
  FROM public.platform_revenue
  WHERE created_at > NOW() - (p_days || ' days')::INTERVAL;

  SELECT json_object_agg(type, total) INTO v_by_type
  FROM (
    SELECT type, SUM(amount_cents) as total
    FROM public.platform_revenue
    WHERE created_at > NOW() - (p_days || ' days')::INTERVAL
    GROUP BY type
  ) t;

  RETURN json_build_object(
    'period_days', p_days,
    'total_cents', v_total,
    'total_usd', v_total / 100.0,
    'by_type', v_by_type
  );
END;
$$ LANGUAGE plpgsql;
