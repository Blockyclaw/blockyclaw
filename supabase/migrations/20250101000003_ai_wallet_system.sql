-- =====================
-- AI Agents (AIエージェント登録)
-- =====================
CREATE TABLE public.ai_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  api_key TEXT UNIQUE NOT NULL, -- sk_agent_xxx
  api_key_hash TEXT NOT NULL, -- For secure lookup

  -- Wallet
  balance INTEGER DEFAULT 0, -- JPY balance
  lifetime_spent INTEGER DEFAULT 0,

  -- Limits & Rules
  monthly_budget INTEGER, -- NULL = unlimited
  per_purchase_limit INTEGER, -- Max per single purchase
  allowed_categories UUID[] DEFAULT '{}', -- Empty = all allowed
  blocked_categories UUID[] DEFAULT '{}',
  auto_purchase_enabled BOOLEAN DEFAULT TRUE,
  require_approval_above INTEGER, -- Require human approval above this amount

  -- Stats
  total_purchases INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_agents_owner ON public.ai_agents(owner_id);
CREATE INDEX idx_ai_agents_api_key_hash ON public.ai_agents(api_key_hash);

-- =====================
-- AI Wallet Transactions (入出金履歴)
-- =====================
CREATE TYPE wallet_tx_type AS ENUM ('deposit', 'purchase', 'refund', 'withdrawal');

CREATE TABLE public.ai_wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  type wallet_tx_type NOT NULL,
  amount INTEGER NOT NULL, -- Positive for deposit/refund, negative for purchase
  balance_after INTEGER NOT NULL,

  -- Reference
  purchase_id UUID REFERENCES public.purchases(id),
  skill_id UUID REFERENCES public.skills(id),
  stripe_payment_intent_id TEXT,

  -- Metadata
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wallet_tx_agent ON public.ai_wallet_transactions(agent_id);

-- =====================
-- AI Purchase Requests (承認待ち購入)
-- =====================
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'expired');

CREATE TABLE public.ai_purchase_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  license_type license_type NOT NULL,
  price INTEGER NOT NULL,

  -- AI's reasoning for the purchase
  reason TEXT,

  -- Approval
  status approval_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Auto-expire after 24 hours
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_purchase_requests_agent ON public.ai_purchase_requests(agent_id);
CREATE INDEX idx_purchase_requests_status ON public.ai_purchase_requests(status);

-- =====================
-- AI Skill Ownership (AI所有スキル)
-- =====================
CREATE TABLE public.ai_skill_ownership (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES public.purchases(id),
  license_type license_type NOT NULL,

  -- Access
  skill_md_content TEXT NOT NULL, -- Cached for AI access
  installed_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  use_count INTEGER DEFAULT 0,

  UNIQUE(agent_id, skill_id)
);

CREATE INDEX idx_ai_ownership_agent ON public.ai_skill_ownership(agent_id);

-- =====================
-- Row Level Security
-- =====================
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_skill_ownership ENABLE ROW LEVEL SECURITY;

-- Agents: Owner can manage
CREATE POLICY "Owners can manage own agents" ON public.ai_agents
  FOR ALL USING (auth.uid() = owner_id);

-- Wallet transactions: Owner can view
CREATE POLICY "Owners can view agent transactions" ON public.ai_wallet_transactions
  FOR SELECT USING (
    agent_id IN (SELECT id FROM public.ai_agents WHERE owner_id = auth.uid())
  );

-- Purchase requests: Owner can manage
CREATE POLICY "Owners can manage purchase requests" ON public.ai_purchase_requests
  FOR ALL USING (
    agent_id IN (SELECT id FROM public.ai_agents WHERE owner_id = auth.uid())
  );

-- Skill ownership: Owner can view
CREATE POLICY "Owners can view agent skills" ON public.ai_skill_ownership
  FOR SELECT USING (
    agent_id IN (SELECT id FROM public.ai_agents WHERE owner_id = auth.uid())
  );

-- =====================
-- Functions
-- =====================

-- Generate secure API key
CREATE OR REPLACE FUNCTION generate_agent_api_key()
RETURNS TEXT AS $$
DECLARE
  key TEXT;
BEGIN
  key := 'sk_agent_' || encode(gen_random_bytes(24), 'hex');
  RETURN key;
END;
$$ LANGUAGE plpgsql;

-- Process AI purchase
CREATE OR REPLACE FUNCTION process_ai_purchase(
  p_agent_id UUID,
  p_skill_id UUID,
  p_license_type license_type
)
RETURNS JSON AS $$
DECLARE
  v_agent RECORD;
  v_skill RECORD;
  v_price INTEGER;
  v_purchase_id UUID;
  v_new_balance INTEGER;
BEGIN
  -- Get agent
  SELECT * INTO v_agent FROM public.ai_agents WHERE id = p_agent_id AND is_active = TRUE;
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Agent not found or inactive');
  END IF;

  -- Get skill
  SELECT * INTO v_skill FROM public.skills WHERE id = p_skill_id AND is_published = TRUE;
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Skill not found');
  END IF;

  -- Determine price
  v_price := CASE p_license_type
    WHEN 'team' THEN COALESCE(v_skill.team_price, v_skill.price)
    WHEN 'enterprise' THEN COALESCE(v_skill.enterprise_price, v_skill.price)
    ELSE v_skill.price
  END;

  -- Check balance
  IF v_agent.balance < v_price THEN
    RETURN json_build_object('error', 'Insufficient balance', 'required', v_price, 'available', v_agent.balance);
  END IF;

  -- Check per-purchase limit
  IF v_agent.per_purchase_limit IS NOT NULL AND v_price > v_agent.per_purchase_limit THEN
    RETURN json_build_object('error', 'Exceeds per-purchase limit', 'limit', v_agent.per_purchase_limit);
  END IF;

  -- Check if requires approval
  IF v_agent.require_approval_above IS NOT NULL AND v_price > v_agent.require_approval_above THEN
    -- Create approval request instead
    INSERT INTO public.ai_purchase_requests (agent_id, skill_id, license_type, price)
    VALUES (p_agent_id, p_skill_id, p_license_type, v_price)
    RETURNING id INTO v_purchase_id;

    RETURN json_build_object('status', 'approval_required', 'request_id', v_purchase_id);
  END IF;

  -- Check category restrictions
  IF array_length(v_agent.allowed_categories, 1) > 0 AND
     NOT (v_skill.category_id = ANY(v_agent.allowed_categories)) THEN
    RETURN json_build_object('error', 'Category not allowed');
  END IF;

  IF v_skill.category_id = ANY(v_agent.blocked_categories) THEN
    RETURN json_build_object('error', 'Category blocked');
  END IF;

  -- Check if already owned
  IF EXISTS (SELECT 1 FROM public.ai_skill_ownership WHERE agent_id = p_agent_id AND skill_id = p_skill_id) THEN
    RETURN json_build_object('error', 'Already owned');
  END IF;

  -- Deduct balance
  v_new_balance := v_agent.balance - v_price;
  UPDATE public.ai_agents
  SET balance = v_new_balance,
      lifetime_spent = lifetime_spent + v_price,
      total_purchases = total_purchases + 1,
      last_active_at = NOW()
  WHERE id = p_agent_id;

  -- Record transaction
  INSERT INTO public.ai_wallet_transactions (agent_id, type, amount, balance_after, skill_id, description)
  VALUES (p_agent_id, 'purchase', -v_price, v_new_balance, p_skill_id, 'Skill purchase: ' || v_skill.title);

  -- Create purchase record
  INSERT INTO public.purchases (buyer_id, skill_id, license_type, price_paid, status)
  VALUES (v_agent.owner_id, p_skill_id, p_license_type, v_price, 'completed')
  RETURNING id INTO v_purchase_id;

  -- Grant ownership
  INSERT INTO public.ai_skill_ownership (agent_id, skill_id, purchase_id, license_type, skill_md_content)
  VALUES (p_agent_id, p_skill_id, v_purchase_id, p_license_type, v_skill.skill_md_content);

  -- Increment download count
  UPDATE public.skills SET download_count = download_count + 1 WHERE id = p_skill_id;

  RETURN json_build_object(
    'status', 'success',
    'purchase_id', v_purchase_id,
    'skill_title', v_skill.title,
    'price_paid', v_price,
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Deposit to agent wallet
CREATE OR REPLACE FUNCTION deposit_to_agent(
  p_agent_id UUID,
  p_amount INTEGER,
  p_stripe_payment_intent_id TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  IF p_amount <= 0 THEN
    RETURN json_build_object('error', 'Amount must be positive');
  END IF;

  UPDATE public.ai_agents
  SET balance = balance + p_amount
  WHERE id = p_agent_id
  RETURNING balance INTO v_new_balance;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Agent not found');
  END IF;

  INSERT INTO public.ai_wallet_transactions (
    agent_id, type, amount, balance_after, stripe_payment_intent_id, description
  )
  VALUES (
    p_agent_id, 'deposit', p_amount, v_new_balance, p_stripe_payment_intent_id, 'Wallet deposit'
  );

  RETURN json_build_object('status', 'success', 'new_balance', v_new_balance);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
