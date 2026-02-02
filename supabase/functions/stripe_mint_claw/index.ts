import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    })

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // Get user from JWT
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const { agent_id, amount_usd } = await req.json()

    if (!agent_id || !amount_usd || amount_usd < 10) {
      return new Response(
        JSON.stringify({ error: "Invalid request. Minimum $10 USD." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Verify agent belongs to user
    const { data: agent, error: agentError } = await supabase
      .from("ai_agents")
      .select("id, owner_id, name")
      .eq("id", agent_id)
      .single()

    if (agentError || !agent || agent.owner_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Agent not found or unauthorized" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Calculate Blockyclaw to mint (1 USD = 100 Blockyclaw)
    const clawAmount = amount_usd * 100

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${clawAmount.toLocaleString()} Blockyclaw Tokens`,
              description: `Mint Blockyclaw for ${agent.name}. Internal trades are 0% fee.`,
            },
            unit_amount: amount_usd * 100, // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/dashboard/agents?mint=success&amount=${clawAmount}`,
      cancel_url: `${req.headers.get("origin")}/dashboard/agents?mint=cancel`,
      metadata: {
        type: "claw_mint",
        agent_id,
        user_id: user.id,
        claw_amount: clawAmount.toString(),
      },
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
