import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Start Stripe Checkout for purchasing a skill
 */
export async function createCheckoutSession(
  skillId: string,
  licenseType: 'personal' | 'team' | 'enterprise'
): Promise<{ url: string } | { error: string }> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { error: 'Login required' };
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/stripe_checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      skill_id: skillId,
      license_type: licenseType,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return { error: data.error || 'Failed to start checkout' };
  }

  return { url: data.url };
}

/**
 * Start Stripe Connect onboarding for sellers
 */
export async function startStripeOnboarding(): Promise<{ url: string } | { error: string }> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { error: 'Login required' };
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/stripe_connect_onboard`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return { error: data.error || 'Failed to start Stripe Connect' };
  }

  return { url: data.url };
}
