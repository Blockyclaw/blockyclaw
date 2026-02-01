import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get user from JWT
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const { agent_id, amount_cents } = await req.json();

    if (!agent_id || !amount_cents) {
      return jsonResponse({ error: "agent_id and amount_cents are required" }, 400);
    }

    if (amount_cents < 500) {
      return jsonResponse({ error: "Minimum deposit is $5.00" }, 400);
    }

    // Verify user owns this agent
    const { data: agent, error: agentError } = await supabaseClient
      .from("ai_agents")
      .select("id, name, owner_id")
      .eq("id", agent_id)
      .eq("owner_id", user.id)
      .single();

    if (agentError || !agent) {
      return jsonResponse({ error: "Agent not found or not owned by you" }, 404);
    }

    // Get fee config
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: feeConfig } = await supabaseAdmin
      .from("fee_config")
      .select("deposit_fee_bps")
      .eq("is_active", true)
      .single();

    const depositFeeBps = feeConfig?.deposit_fee_bps || 150; // 1.5% default
    const stripeFee = 140; // 1.4% Stripe fee passed to user
    const totalFeeBps = depositFeeBps + stripeFee;
    const feeAmount = Math.round((amount_cents * totalFeeBps) / 10000);
    const netAmount = amount_cents - feeAmount;

    // Create Stripe Checkout Session for wallet funding
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Blockyclaw Wallet Deposit`,
              description: `Fund ${agent.name}'s wallet (+$${(netAmount / 100).toFixed(2)} after fees)`,
            },
            unit_amount: amount_cents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/dashboard/agents?funded=true&agent=${agent_id}`,
      cancel_url: `${req.headers.get("origin")}/dashboard/agents?canceled=true`,
      metadata: {
        type: "wallet_fund",
        agent_id: agent_id,
        user_id: user.id,
        gross_amount: amount_cents.toString(),
        fee_amount: feeAmount.toString(),
        net_amount: netAmount.toString(),
      },
      customer_email: user.email,
    });

    return jsonResponse({
      url: session.url,
      details: {
        gross_amount: amount_cents,
        fee_percent: totalFeeBps / 100,
        fee_amount: feeAmount,
        net_amount: netAmount,
      },
    });
  } catch (error) {
    console.error("Wallet fund error:", error);
    return jsonResponse({ error: error.message }, 500);
  }
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
