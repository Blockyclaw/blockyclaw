-- =============================================
-- $CLAW Token System
-- Internal trades = 0% fee
-- Only charge on deposit/withdrawal
-- =============================================

-- Update fee config: internal trades are FREE
UPDATE fee_config SET fee_bps = 0, description = 'Skill trading (FREE with $CLAW)' WHERE item_type = 'skill';
UPDATE fee_config SET fee_bps = 0, description = 'API trading (FREE with $CLAW)' WHERE item_type = 'api';
UPDATE fee_config SET fee_bps = 0, description = 'Model trading (FREE with $CLAW)' WHERE item_type = 'model';
UPDATE fee_config SET fee_bps = 0, description = 'LoRA trading (FREE with $CLAW)' WHERE item_type = 'lora';
UPDATE fee_config SET fee_bps = 0, description = 'Prompt trading (FREE with $CLAW)' WHERE item_type = 'prompt';
UPDATE fee_config SET fee_bps = 0, description = 'Data trading (FREE with $CLAW)' WHERE item_type = 'data';
UPDATE fee_config SET fee_bps = 0, description = 'Compute trading (FREE with $CLAW)' WHERE item_type = 'compute';
UPDATE fee_config SET fee_bps = 0, description = 'Agent hire (FREE with $CLAW)' WHERE item_type = 'agent_hire';

-- Only charge on fiat conversion
UPDATE fee_config SET fee_bps = 290, min_fee_cents = 0, description = 'USD → $CLAW (Stripe fee only)' WHERE item_type = 'deposit';
UPDATE fee_config SET fee_bps = 200, min_fee_cents = 100, description = '$CLAW → USDC (2% + $1 min)' WHERE item_type = 'withdrawal';

-- Add token metadata
CREATE TABLE IF NOT EXISTS token_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT UNIQUE NOT NULL DEFAULT 'CLAW',
  name TEXT NOT NULL DEFAULT 'Blockyclaw Token',
  decimals INT DEFAULT 2, -- 2 decimal places (like cents)
  total_supply BIGINT DEFAULT 0, -- minted on deposit
  circulating_supply BIGINT DEFAULT 0,
  logo_url TEXT,
  contract_address TEXT, -- future: when deployed to chain
  chain TEXT, -- future: 'base', 'polygon', etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert token info
INSERT INTO token_info (symbol, name, decimals)
VALUES ('CLAW', 'Blockyclaw Token', 2)
ON CONFLICT (symbol) DO NOTHING;

-- Token supply tracking
CREATE TABLE IF NOT EXISTS token_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('mint', 'burn', 'transfer')),
  amount BIGINT NOT NULL,
  from_agent_id UUID REFERENCES ai_agents(id),
  to_agent_id UUID REFERENCES ai_agents(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop existing functions to change signatures
DROP FUNCTION IF EXISTS process_deposit(UUID, INT, TEXT);
DROP FUNCTION IF EXISTS process_withdrawal(UUID, INT);

-- Update process_deposit to mint $CLAW
CREATE OR REPLACE FUNCTION process_deposit(
  p_agent_id UUID,
  p_gross_cents INT,
  p_stripe_payment_intent TEXT
) RETURNS JSONB AS $$
DECLARE
  v_agent ai_agents%ROWTYPE;
  v_fee_config fee_config%ROWTYPE;
  v_fee_cents INT;
  v_net_claw INT; -- $CLAW amount (same as cents, 1:1)
  v_new_balance INT;
BEGIN
  SELECT * INTO v_agent FROM ai_agents WHERE id = p_agent_id FOR UPDATE;

  IF v_agent IS NULL THEN
    RETURN jsonb_build_object('error', 'Agent not found');
  END IF;

  -- Get deposit fee (Stripe fee)
  SELECT * INTO v_fee_config FROM fee_config WHERE item_type = 'deposit' AND is_active = TRUE;
  v_fee_cents := (p_gross_cents * COALESCE(v_fee_config.fee_bps, 290)) / 10000;
  v_net_claw := p_gross_cents - v_fee_cents;

  -- Credit $CLAW balance
  v_new_balance := v_agent.balance + v_net_claw;
  UPDATE ai_agents
  SET balance = v_new_balance,
      total_deposited = total_deposited + v_net_claw,
      updated_at = NOW()
  WHERE id = p_agent_id;

  -- Record transaction
  INSERT INTO wallet_transactions (agent_id, type, amount, fee_cents, balance_after, reference_type, reference_id, description)
  VALUES (p_agent_id, 'deposit', v_net_claw, v_fee_cents, v_new_balance, 'stripe', p_stripe_payment_intent, 'Minted $CLAW from USD deposit');

  -- Record token mint event
  INSERT INTO token_events (event_type, amount, to_agent_id, description)
  VALUES ('mint', v_net_claw, p_agent_id, 'Minted from USD deposit');

  -- Update total supply
  UPDATE token_info SET total_supply = total_supply + v_net_claw, circulating_supply = circulating_supply + v_net_claw WHERE symbol = 'CLAW';

  RETURN jsonb_build_object(
    'status', 'success',
    'usd_paid', p_gross_cents,
    'stripe_fee', v_fee_cents,
    'claw_minted', v_net_claw,
    'new_balance', v_new_balance,
    'message', 'Successfully minted $CLAW tokens'
  );
END;
$$ LANGUAGE plpgsql;

-- Update process_withdrawal to burn $CLAW
CREATE OR REPLACE FUNCTION process_withdrawal(
  p_agent_id UUID,
  p_claw_amount INT
) RETURNS JSONB AS $$
DECLARE
  v_agent ai_agents%ROWTYPE;
  v_fee_config fee_config%ROWTYPE;
  v_fee_claw INT;
  v_net_usdc INT; -- USDC cents to receive
  v_new_balance INT;
BEGIN
  SELECT * INTO v_agent FROM ai_agents WHERE id = p_agent_id FOR UPDATE;

  IF v_agent IS NULL THEN
    RETURN jsonb_build_object('error', 'Agent not found');
  END IF;

  IF v_agent.balance < p_claw_amount THEN
    RETURN jsonb_build_object('error', 'Insufficient $CLAW balance');
  END IF;

  -- Get withdrawal fee
  SELECT * INTO v_fee_config FROM fee_config WHERE item_type = 'withdrawal' AND is_active = TRUE;
  v_fee_claw := GREATEST(
    (p_claw_amount * COALESCE(v_fee_config.fee_bps, 200)) / 10000,
    COALESCE(v_fee_config.min_fee_cents, 100)
  );
  v_net_usdc := p_claw_amount - v_fee_claw;

  -- Deduct $CLAW balance
  v_new_balance := v_agent.balance - p_claw_amount;
  UPDATE ai_agents
  SET balance = v_new_balance,
      updated_at = NOW()
  WHERE id = p_agent_id;

  -- Record transaction
  INSERT INTO wallet_transactions (agent_id, type, amount, fee_cents, balance_after, description)
  VALUES (p_agent_id, 'withdrawal', -p_claw_amount, v_fee_claw, v_new_balance, 'Burned $CLAW for USDC withdrawal');

  -- Record token burn event
  INSERT INTO token_events (event_type, amount, from_agent_id, description)
  VALUES ('burn', p_claw_amount, p_agent_id, 'Burned for USDC withdrawal');

  -- Update total supply
  UPDATE token_info SET total_supply = total_supply - p_claw_amount, circulating_supply = circulating_supply - p_claw_amount WHERE symbol = 'CLAW';

  RETURN jsonb_build_object(
    'status', 'pending',
    'claw_burned', p_claw_amount,
    'withdrawal_fee', v_fee_claw,
    'usdc_to_receive', v_net_usdc,
    'new_balance', v_new_balance,
    'message', 'Withdrawal pending. USDC will be sent within 1-3 business days.'
  );
END;
$$ LANGUAGE plpgsql;

-- Update purchase function: 0% fee for internal $CLAW trades
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
      'error', 'Insufficient $CLAW balance',
      'required', v_item.price_cents,
      'available', v_buyer.balance
    );
  END IF;

  -- NO FEE for internal $CLAW trades!
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

  -- Credit seller 100% (no platform fee!)
  IF v_item.seller_agent_id IS NOT NULL THEN
    SELECT * INTO v_seller_agent FROM ai_agents WHERE id = v_item.seller_agent_id FOR UPDATE;

    UPDATE ai_agents
    SET balance = balance + v_item.price_cents,
        total_earned = total_earned + v_item.price_cents,
        updated_at = NOW()
    WHERE id = v_item.seller_agent_id;

    -- Record seller transaction
    INSERT INTO wallet_transactions (agent_id, type, amount, fee_cents, balance_after, reference_type, reference_id, description)
    VALUES (v_item.seller_agent_id, 'sale', v_item.price_cents, 0, v_seller_agent.balance + v_item.price_cents, 'item', p_item_id::TEXT, 'Sold: ' || v_item.title);

    -- Record token transfer event
    INSERT INTO token_events (event_type, amount, from_agent_id, to_agent_id, description)
    VALUES ('transfer', v_item.price_cents, p_buyer_agent_id, v_item.seller_agent_id, 'Purchase: ' || v_item.title);
  END IF;

  -- Record ownership
  INSERT INTO item_ownership (agent_id, item_id, purchase_price_cents, fee_cents)
  VALUES (p_buyer_agent_id, p_item_id, v_item.price_cents, 0);

  -- Update item stats
  UPDATE marketplace_items SET download_count = download_count + 1 WHERE id = p_item_id;

  -- Record analytics
  INSERT INTO purchase_analytics (item_id, buyer_agent_id, seller_agent_id, price_cents, fee_cents, search_query, reason)
  VALUES (p_item_id, p_buyer_agent_id, v_item.seller_agent_id, v_item.price_cents, 0, p_search_query, p_reason);

  RETURN jsonb_build_object(
    'status', 'success',
    'item_id', p_item_id,
    'item_title', v_item.title,
    'item_type', v_item.type,
    'price_claw', v_item.price_cents,
    'fee_claw', 0,
    'seller_receives', v_item.price_cents,
    'buyer_new_balance', v_buyer_new_balance,
    'message', '0% fee with $CLAW!'
  );
END;
$$ LANGUAGE plpgsql;

-- Token stats view
CREATE OR REPLACE VIEW v_token_stats AS
SELECT
  ti.symbol,
  ti.name,
  ti.total_supply,
  ti.circulating_supply,
  (SELECT COUNT(*) FROM ai_agents WHERE balance > 0) as holders,
  (SELECT SUM(amount) FROM token_events WHERE event_type = 'mint') as total_minted,
  (SELECT SUM(amount) FROM token_events WHERE event_type = 'burn') as total_burned,
  (SELECT COUNT(*) FROM token_events WHERE event_type = 'transfer' AND created_at > NOW() - INTERVAL '24 hours') as transfers_24h,
  (SELECT SUM(amount) FROM token_events WHERE event_type = 'transfer' AND created_at > NOW() - INTERVAL '24 hours') as volume_24h
FROM token_info ti
WHERE ti.symbol = 'CLAW';
