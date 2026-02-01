import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
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
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { skill_id, license_type } = await req.json();

    // Get skill details
    const { data: skill, error: skillError } = await supabaseClient
      .from("skills")
      .select("*, seller:users!seller_id(stripe_account_id)")
      .eq("id", skill_id)
      .single();

    if (skillError || !skill) {
      return new Response(
        JSON.stringify({ error: "Skill not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine price based on license type
    let price: number;
    switch (license_type) {
      case "team":
        price = skill.team_price || skill.price;
        break;
      case "enterprise":
        price = skill.enterprise_price || skill.price;
        break;
      default:
        price = skill.price;
    }

    if (!skill.seller?.stripe_account_id) {
      return new Response(
        JSON.stringify({ error: "Seller has not completed Stripe setup" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate platform fee (10%)
    const platformFeePercent = parseInt(Deno.env.get("PLATFORM_FEE_PERCENT") || "10");
    const applicationFee = Math.round(price * (platformFeePercent / 100));

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: {
              name: skill.title,
              description: `${license_type === "personal" ? "個人" : license_type === "team" ? "チーム" : "企業"}ライセンス`,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/dashboard/buyer?success=true&skill=${skill.slug}`,
      cancel_url: `${req.headers.get("origin")}/skills/${skill.slug}?canceled=true`,
      payment_intent_data: {
        application_fee_amount: applicationFee,
        transfer_data: {
          destination: skill.seller.stripe_account_id,
        },
      },
      metadata: {
        skill_id: skill.id,
        buyer_id: user.id,
        license_type: license_type,
      },
      customer_email: user.email,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
