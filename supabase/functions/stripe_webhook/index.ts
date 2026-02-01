import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const signature = req.headers.get("stripe-signature");
    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // For testing without webhook signature verification
      event = JSON.parse(body);
    }

    console.log(`Processing event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.payment_status === "paid") {
          const { skill_id, buyer_id, license_type } = session.metadata || {};

          if (skill_id && buyer_id) {
            // Record the purchase
            const { error } = await supabaseAdmin.from("purchases").insert({
              buyer_id,
              skill_id,
              license_type,
              price_paid: session.amount_total,
              stripe_payment_intent_id: session.payment_intent as string,
              status: "completed",
            });

            if (error) {
              console.error("Failed to record purchase:", error);
              throw error;
            }

            // Increment download count
            await supabaseAdmin.rpc("increment_download_count", {
              p_skill_id: skill_id,
            });

            console.log(`Purchase recorded for skill ${skill_id} by user ${buyer_id}`);
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed: ${paymentIntent.id}`);
        break;
      }

      case "account.updated": {
        // Connected account updated (e.g., onboarding completed)
        const account = event.data.object as Stripe.Account;

        if (account.details_submitted && account.charges_enabled) {
          // Update user's is_seller status
          const { error } = await supabaseAdmin
            .from("users")
            .update({ is_seller: true })
            .eq("stripe_account_id", account.id);

          if (error) {
            console.error("Failed to update seller status:", error);
          } else {
            console.log(`Seller status activated for account ${account.id}`);
          }
        }
        break;
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
