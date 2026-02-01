-- Add claim system to ai_agents
ALTER TABLE public.ai_agents
  ALTER COLUMN owner_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS claim_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS claim_expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_ai_agents_claim_token ON public.ai_agents(claim_token);

-- Claim agent function
CREATE OR REPLACE FUNCTION claim_agent(
  p_claim_token TEXT,
  p_user_id UUID,
  p_monthly_budget INTEGER DEFAULT NULL,
  p_per_purchase_limit INTEGER DEFAULT NULL,
  p_require_approval_above INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_agent RECORD;
BEGIN
  -- Find unclaimed agent
  SELECT * INTO v_agent
  FROM public.ai_agents
  WHERE claim_token = p_claim_token
    AND owner_id IS NULL
    AND claim_expires_at > NOW();

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Invalid or expired claim token');
  END IF;

  -- Claim the agent
  UPDATE public.ai_agents
  SET
    owner_id = p_user_id,
    is_active = TRUE,
    claim_token = NULL, -- Clear token after claim
    claim_expires_at = NULL,
    monthly_budget = p_monthly_budget,
    per_purchase_limit = p_per_purchase_limit,
    require_approval_above = p_require_approval_above,
    updated_at = NOW()
  WHERE id = v_agent.id;

  -- Clear the stored API key (keep only hash)
  -- In production, you'd show this once and never store plaintext
  -- For demo, we keep it

  RETURN json_build_object(
    'status', 'success',
    'agent_id', v_agent.id,
    'agent_name', v_agent.name,
    'message', 'Agent claimed successfully. Fund the wallet to enable purchases.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create claim page record for tracking
CREATE TABLE IF NOT EXISTS public.agent_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  claimed_by UUID REFERENCES public.users(id),
  claimed_at TIMESTAMPTZ,
  verification_method TEXT, -- 'twitter', 'email', 'manual'
  verification_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update RLS for agents to allow reading unclaimed agents by claim token
CREATE POLICY "Anyone can read agent by claim token" ON public.ai_agents
  FOR SELECT USING (
    claim_token IS NOT NULL
    AND owner_id IS NULL
    AND claim_expires_at > NOW()
  );
