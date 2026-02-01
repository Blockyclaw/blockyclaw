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

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user from JWT
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user already has a Stripe account
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("stripe_account_id")
      .eq("id", user.id)
      .single();

    let accountId = userData?.stripe_account_id;

    // Create new Stripe Express account if doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "JP",
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: {
          supabase_user_id: user.id,
        },
      });

      accountId = account.id;

      // Save Stripe account ID to user
      await supabaseAdmin
        .from("users")
        .update({ stripe_account_id: accountId })
        .eq("id", user.id);
    }

    // Create Account Link for onboarding
    const origin = req.headers.get("origin") || "http://localhost:5173";
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/dashboard/seller/settings?stripe_refresh=true`,
      return_url: `${origin}/dashboard/seller/settings?stripe_success=true`,
      type: "account_onboarding",
    });

    return new Response(
      JSON.stringify({ url: accountLink.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Stripe Connect onboard error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
