import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
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

    const signature = req.headers.get("stripe-signature")
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing stripe signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const body = await req.text()
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message)
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      const metadata = session.metadata

      if (metadata?.type === "claw_mint") {
        const agentId = metadata.agent_id
        const clawAmount = parseInt(metadata.claw_amount)
        const userId = metadata.user_id

        await supabase.from("token_events").insert({
          user_id: userId,
          agent_id: agentId,
          event_type: "mint",
          amount: clawAmount,
          fee_amount: 0,
          stripe_session_id: session.id,
          metadata: {
            usd_amount: session.amount_total ? session.amount_total / 100 : 0,
            payment_intent: session.payment_intent,
          },
        })

        // Use RPC to atomically increment balance
        const { error: updateError } = await supabase.rpc("increment_agent_balance", {
          p_agent_id: agentId,
          p_amount: clawAmount,
        })

        if (updateError) {
          console.error("Failed to update balance:", updateError)
          // Fallback: direct update (not atomic but works)
          const { data: agent } = await supabase
            .from("ai_agents")
            .select("balance")
            .eq("id", agentId)
            .single()

          if (agent) {
            await supabase
              .from("ai_agents")
              .update({ balance: agent.balance + clawAmount })
              .eq("id", agentId)
          }
        }

        console.log(`Minted ${clawAmount} Blockyclaw for agent ${agentId}`)
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Webhook error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
