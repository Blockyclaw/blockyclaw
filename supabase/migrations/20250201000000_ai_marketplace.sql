-- =============================================
-- AI Agent Marketplace - Full Schema
-- =============================================

-- =============================================
-- 1. AI AGENTS (AIエージェント)
-- =============================================
CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  api_key_hash TEXT UNIQUE NOT NULL, -- SHA-256 hash of sk_agent_xxx

  -- Wallet
  balance INT DEFAULT 0, -- cents (USD)
  total_deposited INT DEFAULT 0,
  total_spent INT DEFAULT 0,
  total_earned INT DEFAULT 0,

  -- Settings
  auto_purchase_enabled BOOLEAN DEFAULT TRUE,
  monthly_budget INT, -- cents
  per_purchase_limit INT, -- cents
  require_approval_above INT, -- cents
  allowed_categories TEXT[],
  blocked_categories TEXT[],

  -- Status
  is_active BOOLEAN DEFAULT FALSE, -- activated after human claims
  is_claimed BOOLEAN DEFAULT FALSE,
  claim_token TEXT UNIQUE,
  claim_expires_at TIMESTAMPTZ,

  -- Timestamps
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for API key lookup
CREATE INDEX IF NOT EXISTS idx_ai_agents_api_key ON ai_agents(api_key_hash);
CREATE INDEX IF NOT EXISTS idx_ai_agents_owner ON ai_agents(owner_id);

-- =============================================
-- 2. FEE CONFIG (手数料設定)
-- =============================================
CREATE TABLE IF NOT EXISTS fee_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type TEXT UNIQUE NOT NULL,
  fee_bps INT NOT NULL, -- basis points (1500 = 15%)
  min_fee_cents INT DEFAULT 50, -- minimum $0.50
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default fees
INSERT INTO fee_config (item_type, fee_bps, description) VALUES
  ('skill', 1500, 'Claude Code skills'),
  ('api', 1200, 'API endpoints'),
  ('model', 2000, 'AI models'),
  ('lora', 2000, 'Fine-tuned adapters'),
  ('prompt', 1500, 'Prompt templates'),
  ('data', 1000, 'Datasets'),
  ('compute', 500, 'GPU/compute time'),
  ('agent_hire', 2500, 'Hire another agent')
ON CONFLICT (item_type) DO NOTHING;

-- Global fees
INSERT INTO fee_config (item_type, fee_bps, description) VALUES
  ('deposit', 290, 'Stripe deposit fee (2.9%)'),
  ('withdrawal', 200, 'Withdrawal fee (2%)')
ON CONFLICT (item_type) DO NOTHING;

-- =============================================
-- 3. MARKETPLACE ITEMS (出品アイテム)
-- =============================================
CREATE TABLE IF NOT EXISTS marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Seller (human or AI)
  seller_id UUID REFERENCES auth.users(id), -- human owner
  seller_agent_id UUID REFERENCES ai_agents(id), -- if AI listed it

  -- Item info
  type TEXT NOT NULL CHECK (type IN ('skill', 'api', 'model', 'lora', 'prompt', 'data', 'compute', 'agent_hire')),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  long_description TEXT,

  -- Pricing (in cents USD)
  price_cents INT NOT NULL CHECK (price_cents >= 0),

  -- Content (depends on type)
  content_md TEXT, -- markdown content for skills/prompts
  api_endpoint TEXT, -- for API type
  api_docs TEXT, -- API documentation
  content_url TEXT, -- download URL for models/data
  model_url TEXT, -- model weights URL

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  version TEXT DEFAULT '1.0.0',

  -- Stats
  download_count INT DEFAULT 0,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  rating_count INT DEFAULT 0,

  -- Status
  is_published BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE, -- platform verified
  is_featured BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_type ON marketplace_items(type);
CREATE INDEX IF NOT EXISTS idx_marketplace_seller ON marketplace_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_published ON marketplace_items(is_published);

-- =============================================
-- 4. ITEM OWNERSHIP (購入済みアイテム)
-- =============================================
CREATE TABLE IF NOT EXISTS item_ownership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
  item_id UUID REFERENCES marketplace_items(id) ON DELETE CASCADE,

  purchase_price_cents INT NOT NULL,
  fee_cents INT NOT NULL,

  -- Usage tracking
  use_count INT DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  purchased_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(agent_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_ownership_agent ON item_ownership(agent_id);

-- =============================================
-- 5. WALLET TRANSACTIONS (取引履歴)
-- =============================================
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,

  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'purchase', 'sale', 'fee', 'refund')),

  amount INT NOT NULL, -- positive = credit, negative = debit
  fee_cents INT DEFAULT 0,
  balance_after INT NOT NULL,

  -- Reference
  reference_type TEXT, -- 'item', 'stripe', etc.
  reference_id TEXT,

  description TEXT,
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_agent ON wallet_transactions(agent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON wallet_transactions(created_at DESC);

-- =============================================
-- 6. PURCHASE REQUESTS (承認待ち)
-- =============================================
CREATE TABLE IF NOT EXISTS purchase_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
  item_id UUID REFERENCES marketplace_items(id),

  price_cents INT NOT NULL,
  reason TEXT, -- AI's reason for wanting to buy

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),

  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,

  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_requests_agent ON purchase_requests(agent_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON purchase_requests(status);

-- =============================================
-- 7. ANALYTICS (なぜ売れるか？)
-- =============================================
CREATE TABLE IF NOT EXISTS search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES ai_agents(id),
  query TEXT,
  item_type TEXT,
  results_count INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES marketplace_items(id),
  buyer_agent_id UUID REFERENCES ai_agents(id),
  seller_agent_id UUID REFERENCES ai_agents(id),

  price_cents INT,
  fee_cents INT,

  -- Why purchased
  search_query TEXT, -- what search led to this
  reason TEXT, -- AI's stated reason

  -- Post-purchase behavior
  used_within_1h BOOLEAN DEFAULT FALSE,
  used_within_24h BOOLEAN DEFAULT FALSE,
  total_uses INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_item ON purchase_analytics(item_id);
CREATE INDEX IF NOT EXISTS idx_analytics_time ON purchase_analytics(created_at DESC);

-- =============================================
-- 8. FUNCTIONS (処理関数)
-- =============================================

-- Process marketplace purchase with fees
CREATE OR REPLACE FUNCTION process_marketplace_purchase(
  p_buyer_agent_id UUID,
  p_item_id UUID,
  p_search_query TEXT DEFAULT NULL,
  p_reason TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_item marketplace_items%ROWTYPE;
  v_buyer ai_agents%ROWTYPE;
  v_seller_agent ai_agents%ROWTYPE;
  v_fee_config fee_config%ROWTYPE;
  v_fee_cents INT;
  v_seller_receives INT;
  v_buyer_new_balance INT;
BEGIN
  -- Lock buyer for update
  SELECT * INTO v_buyer FROM ai_agents WHERE id = p_buyer_agent_id FOR UPDATE;

  IF v_buyer IS NULL THEN
    RETURN jsonb_build_object('error', 'Buyer agent not found');
  END IF;

  -- Get item
  SELECT * INTO v_item FROM marketplace_items WHERE id = p_item_id AND is_published = TRUE;

  IF v_item IS NULL THEN
    RETURN jsonb_build_object('error', 'Item not found');
  END IF;

  -- Check already owned
  IF EXISTS (SELECT 1 FROM item_ownership WHERE agent_id = p_buyer_agent_id AND item_id = p_item_id) THEN
    RETURN jsonb_build_object('error', 'Already owned');
  END IF;

  -- Check balance
  IF v_buyer.balance < v_item.price_cents THEN
    RETURN jsonb_build_object(
      'error', 'Insufficient balance',
      'required', v_item.price_cents,
      'available', v_buyer.balance
    );
  END IF;

  -- Get fee rate
  SELECT * INTO v_fee_config FROM fee_config WHERE item_type = v_item.type AND is_active = TRUE;
  v_fee_cents := GREATEST(
    (v_item.price_cents * COALESCE(v_fee_config.fee_bps, 1500)) / 10000,
    COALESCE(v_fee_config.min_fee_cents, 50)
  );
  v_seller_receives := v_item.price_cents - v_fee_cents;

  -- Deduct from buyer
  v_buyer_new_balance := v_buyer.balance - v_item.price_cents;
  UPDATE ai_agents
  SET balance = v_buyer_new_balance,
      total_spent = total_spent + v_item.price_cents,
      updated_at = NOW()
  WHERE id = p_buyer_agent_id;

  -- Record buyer transaction
  INSERT INTO wallet_transactions (agent_id, type, amount, fee_cents, balance_after, reference_type, reference_id, description)
  VALUES (p_buyer_agent_id, 'purchase', -v_item.price_cents, 0, v_buyer_new_balance, 'item', p_item_id::TEXT, 'Purchased: ' || v_item.title);

  -- Credit seller (if AI seller)
  IF v_item.seller_agent_id IS NOT NULL THEN
    SELECT * INTO v_seller_agent FROM ai_agents WHERE id = v_item.seller_agent_id FOR UPDATE;

    UPDATE ai_agents
    SET balance = balance + v_seller_receives,
        total_earned = total_earned + v_seller_receives,
        updated_at = NOW()
    WHERE id = v_item.seller_agent_id;

    -- Record seller transaction
    INSERT INTO wallet_transactions (agent_id, type, amount, fee_cents, balance_after, reference_type, reference_id, description)
    VALUES (v_item.seller_agent_id, 'sale', v_seller_receives, v_fee_cents, v_seller_agent.balance + v_seller_receives, 'item', p_item_id::TEXT, 'Sold: ' || v_item.title);
  END IF;

  -- Record ownership
  INSERT INTO item_ownership (agent_id, item_id, purchase_price_cents, fee_cents)
  VALUES (p_buyer_agent_id, p_item_id, v_item.price_cents, v_fee_cents);

  -- Update item stats
  UPDATE marketplace_items SET download_count = download_count + 1 WHERE id = p_item_id;

  -- Record analytics
  INSERT INTO purchase_analytics (item_id, buyer_agent_id, seller_agent_id, price_cents, fee_cents, search_query, reason)
  VALUES (p_item_id, p_buyer_agent_id, v_item.seller_agent_id, v_item.price_cents, v_fee_cents, p_search_query, p_reason);

  RETURN jsonb_build_object(
    'status', 'success',
    'item_id', p_item_id,
    'item_title', v_item.title,
    'item_type', v_item.type,
    'price_cents', v_item.price_cents,
    'fee_cents', v_fee_cents,
    'fee_percent', (v_fee_cents::DECIMAL / v_item.price_cents * 100)::DECIMAL(5,2),
    'seller_receives', v_seller_receives,
    'buyer_new_balance', v_buyer_new_balance
  );
END;
$$ LANGUAGE plpgsql;

-- Process deposit (from Stripe)
CREATE OR REPLACE FUNCTION process_deposit(
  p_agent_id UUID,
  p_gross_cents INT,
  p_stripe_payment_intent TEXT
) RETURNS JSONB AS $$
DECLARE
  v_agent ai_agents%ROWTYPE;
  v_fee_config fee_config%ROWTYPE;
  v_fee_cents INT;
  v_net_cents INT;
  v_new_balance INT;
BEGIN
  SELECT * INTO v_agent FROM ai_agents WHERE id = p_agent_id FOR UPDATE;

  IF v_agent IS NULL THEN
    RETURN jsonb_build_object('error', 'Agent not found');
  END IF;

  -- Get deposit fee
  SELECT * INTO v_fee_config FROM fee_config WHERE item_type = 'deposit' AND is_active = TRUE;
  v_fee_cents := (p_gross_cents * COALESCE(v_fee_config.fee_bps, 290)) / 10000;
  v_net_cents := p_gross_cents - v_fee_cents;

  -- Credit balance
  v_new_balance := v_agent.balance + v_net_cents;
  UPDATE ai_agents
  SET balance = v_new_balance,
      total_deposited = total_deposited + v_net_cents,
      updated_at = NOW()
  WHERE id = p_agent_id;

  -- Record transaction
  INSERT INTO wallet_transactions (agent_id, type, amount, fee_cents, balance_after, reference_type, reference_id, description)
  VALUES (p_agent_id, 'deposit', v_net_cents, v_fee_cents, v_new_balance, 'stripe', p_stripe_payment_intent, 'Deposit via Stripe');

  RETURN jsonb_build_object(
    'status', 'success',
    'gross_cents', p_gross_cents,
    'fee_cents', v_fee_cents,
    'net_cents', v_net_cents,
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql;

-- Process withdrawal
CREATE OR REPLACE FUNCTION process_withdrawal(
  p_agent_id UUID,
  p_amount_cents INT
) RETURNS JSONB AS $$
DECLARE
  v_agent ai_agents%ROWTYPE;
  v_fee_config fee_config%ROWTYPE;
  v_fee_cents INT;
  v_net_cents INT;
  v_new_balance INT;
BEGIN
  SELECT * INTO v_agent FROM ai_agents WHERE id = p_agent_id FOR UPDATE;

  IF v_agent IS NULL THEN
    RETURN jsonb_build_object('error', 'Agent not found');
  END IF;

  IF v_agent.balance < p_amount_cents THEN
    RETURN jsonb_build_object('error', 'Insufficient balance');
  END IF;

  -- Get withdrawal fee
  SELECT * INTO v_fee_config FROM fee_config WHERE item_type = 'withdrawal' AND is_active = TRUE;
  v_fee_cents := (p_amount_cents * COALESCE(v_fee_config.fee_bps, 200)) / 10000;
  v_net_cents := p_amount_cents - v_fee_cents;

  -- Deduct balance
  v_new_balance := v_agent.balance - p_amount_cents;
  UPDATE ai_agents
  SET balance = v_new_balance,
      updated_at = NOW()
  WHERE id = p_agent_id;

  -- Record transaction
  INSERT INTO wallet_transactions (agent_id, type, amount, fee_cents, balance_after, description)
  VALUES (p_agent_id, 'withdrawal', -p_amount_cents, v_fee_cents, v_new_balance, 'Withdrawal request');

  RETURN jsonb_build_object(
    'status', 'pending',
    'gross_cents', p_amount_cents,
    'fee_cents', v_fee_cents,
    'net_cents', v_net_cents,
    'new_balance', v_new_balance,
    'message', 'Withdrawal will be processed within 1-3 business days'
  );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 9. VIEWS (分析用ビュー)
-- =============================================

-- Why items sell (人気の理由)
CREATE OR REPLACE VIEW v_item_demand AS
SELECT
  mi.id,
  mi.type,
  mi.title,
  mi.price_cents,
  mi.download_count,
  mi.rating_avg,
  COUNT(DISTINCT pa.buyer_agent_id) as unique_buyers,
  COUNT(pa.id) as total_purchases,
  SUM(pa.price_cents) as total_revenue,
  SUM(pa.fee_cents) as total_fees,
  array_agg(DISTINCT pa.search_query) FILTER (WHERE pa.search_query IS NOT NULL) as search_queries,
  array_agg(DISTINCT pa.reason) FILTER (WHERE pa.reason IS NOT NULL) as purchase_reasons
FROM marketplace_items mi
LEFT JOIN purchase_analytics pa ON mi.id = pa.item_id
GROUP BY mi.id;

-- Search demand (何が求められているか)
CREATE OR REPLACE VIEW v_search_demand AS
SELECT
  query,
  item_type,
  COUNT(*) as search_count,
  AVG(results_count) as avg_results,
  COUNT(*) FILTER (WHERE results_count = 0) as no_results_count
FROM search_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY query, item_type
ORDER BY search_count DESC;

-- Agent trading activity
CREATE OR REPLACE VIEW v_agent_activity AS
SELECT
  a.id,
  a.name,
  a.balance,
  a.total_deposited,
  a.total_spent,
  a.total_earned,
  COUNT(DISTINCT io.item_id) as items_owned,
  COUNT(DISTINCT mi.id) as items_listed,
  (SELECT COUNT(*) FROM wallet_transactions wt WHERE wt.agent_id = a.id AND wt.type = 'purchase') as purchase_count,
  (SELECT COUNT(*) FROM wallet_transactions wt WHERE wt.agent_id = a.id AND wt.type = 'sale') as sale_count
FROM ai_agents a
LEFT JOIN item_ownership io ON a.id = io.agent_id
LEFT JOIN marketplace_items mi ON a.id = mi.seller_agent_id
GROUP BY a.id;
