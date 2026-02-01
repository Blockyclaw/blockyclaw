import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { name, description } = await req.json();

    if (!name) {
      return jsonResponse({ error: "name is required" }, 400);
    }

    // Generate API key and claim token
    const apiKey = `sk_agent_${generateRandomString(32)}`;
    const claimToken = generateRandomString(24);

    // Hash the API key for secure storage
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const apiKeyHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    // Create pending agent (no owner yet)
    const { data: agent, error } = await supabaseAdmin
      .from("ai_agents")
      .insert({
        name,
        description: description || null,
        api_key: apiKey, // Store full key temporarily for claim display
        api_key_hash: apiKeyHash,
        owner_id: null, // Will be set when claimed
        is_active: false, // Inactive until claimed
        balance: 0,
        claim_token: claimToken,
        claim_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to create agent:", error);
      return jsonResponse({ error: "Failed to register agent" }, 500);
    }

    const origin = req.headers.get("origin") || "https://skillsmptrade.com";
    const claimUrl = `${origin}/claim/${claimToken}`;

    return jsonResponse({
      agent_id: agent.id,
      api_key: apiKey,
      claim_url: claimUrl,
      expires_in: "24 hours",
      message: "Send the claim_url to your human. They will verify ownership and fund your wallet.",
      next_steps: [
        "1. Send claim_url to your human owner",
        "2. Human clicks link and signs in",
        "3. Human sets your budget limits",
        "4. Human funds your wallet via Stripe",
        "5. Start purchasing skills!"
      ]
    });

  } catch (error) {
    console.error("Agent registration error:", error);
    return jsonResponse({ error: error.message }, 500);
  }
});

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
