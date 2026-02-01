import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const url = new URL(req.url);
    const path = url.pathname.replace("/agent_approval", "");

    // GET /pending - List pending requests for user's agents
    if (req.method === "GET" && path === "/pending") {
      const { data: requests, error } = await supabaseAdmin
        .from("ai_purchase_requests")
        .select(`
          id,
          price,
          reason,
          status,
          created_at,
          expires_at,
          agent:ai_agents!inner(id, name, owner_id),
          skill:skills(id, title, slug, description)
        `)
        .eq("status", "pending")
        .eq("agent.owner_id", user.id)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        return jsonResponse({ error: error.message }, 500);
      }

      return jsonResponse({ requests });
    }

    // POST /approve - Approve a purchase request
    if (req.method === "POST" && path === "/approve") {
      const { request_id } = await req.json();

      if (!request_id) {
        return jsonResponse({ error: "request_id is required" }, 400);
      }

      // Get request and verify ownership
      const { data: request, error: reqError } = await supabaseAdmin
        .from("ai_purchase_requests")
        .select(`
          *,
          agent:ai_agents!inner(id, name, owner_id, balance)
        `)
        .eq("id", request_id)
        .eq("status", "pending")
        .single();

      if (reqError || !request) {
        return jsonResponse({ error: "Request not found or already processed" }, 404);
      }

      if (request.agent.owner_id !== user.id) {
        return jsonResponse({ error: "Not authorized to approve this request" }, 403);
      }

      if (new Date(request.expires_at) < new Date()) {
        // Mark as expired
        await supabaseAdmin
          .from("ai_purchase_requests")
          .update({ status: "expired" })
          .eq("id", request_id);
        return jsonResponse({ error: "Request has expired" }, 400);
      }

      // Check balance
      if (request.agent.balance < request.price) {
        return jsonResponse({
          error: "Insufficient balance",
          required: request.price,
          available: request.agent.balance,
        }, 400);
      }

      // Process the purchase
      const { data: result, error: purchaseError } = await supabaseAdmin
        .rpc("process_ai_purchase", {
          p_agent_id: request.agent_id,
          p_skill_id: request.skill_id,
          p_license_type: request.license_type,
        });

      if (purchaseError || result.error) {
        return jsonResponse({ error: purchaseError?.message || result.error }, 500);
      }

      // Mark request as approved
      await supabaseAdmin
        .from("ai_purchase_requests")
        .update({
          status: "approved",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", request_id);

      return jsonResponse({
        status: "success",
        message: "Purchase approved and processed",
        purchase: result,
      });
    }

    // POST /reject - Reject a purchase request
    if (req.method === "POST" && path === "/reject") {
      const { request_id, reason } = await req.json();

      if (!request_id) {
        return jsonResponse({ error: "request_id is required" }, 400);
      }

      // Get request and verify ownership
      const { data: request, error: reqError } = await supabaseAdmin
        .from("ai_purchase_requests")
        .select(`
          *,
          agent:ai_agents!inner(id, name, owner_id)
        `)
        .eq("id", request_id)
        .eq("status", "pending")
        .single();

      if (reqError || !request) {
        return jsonResponse({ error: "Request not found or already processed" }, 404);
      }

      if (request.agent.owner_id !== user.id) {
        return jsonResponse({ error: "Not authorized to reject this request" }, 403);
      }

      // Mark request as rejected
      await supabaseAdmin
        .from("ai_purchase_requests")
        .update({
          status: "rejected",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason || "Rejected by owner",
        })
        .eq("id", request_id);

      return jsonResponse({
        status: "success",
        message: "Purchase request rejected",
      });
    }

    // GET /history - Get request history
    if (req.method === "GET" && path === "/history") {
      const limit = parseInt(url.searchParams.get("limit") || "50");

      const { data: requests, error } = await supabaseAdmin
        .from("ai_purchase_requests")
        .select(`
          id,
          price,
          reason,
          status,
          created_at,
          reviewed_at,
          rejection_reason,
          agent:ai_agents!inner(id, name, owner_id),
          skill:skills(id, title, slug)
        `)
        .eq("agent.owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        return jsonResponse({ error: error.message }, 500);
      }

      return jsonResponse({ requests });
    }

    return jsonResponse({ error: "Not found" }, 404);

  } catch (error) {
    console.error("Approval API error:", error);
    return jsonResponse({ error: error.message }, 500);
  }
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
