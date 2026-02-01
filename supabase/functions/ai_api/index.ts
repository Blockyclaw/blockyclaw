import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHash } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

interface AgentContext {
  id: string;
  owner_id: string;
  name: string;
  balance: number;
  auto_purchase_enabled: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Authenticate via API key
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey || !apiKey.startsWith("sk_agent_")) {
      return jsonResponse({ error: "Invalid API key" }, 401);
    }

    // Hash the API key for lookup
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const apiKeyHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    // Find agent
    const { data: agent, error: agentError } = await supabaseAdmin
      .from("ai_agents")
      .select("id, owner_id, name, balance, auto_purchase_enabled, per_purchase_limit, require_approval_above, allowed_categories, blocked_categories")
      .eq("api_key_hash", apiKeyHash)
      .eq("is_active", true)
      .single();

    if (agentError || !agent) {
      return jsonResponse({ error: "Agent not found or inactive" }, 401);
    }

    // Update last active
    await supabaseAdmin
      .from("ai_agents")
      .update({ last_active_at: new Date().toISOString() })
      .eq("id", agent.id);

    // Route based on path
    const url = new URL(req.url);
    const path = url.pathname.replace("/ai_api", "");

    // GET /me - Agent info
    if (req.method === "GET" && path === "/me") {
      return jsonResponse({
        id: agent.id,
        name: agent.name,
        balance: agent.balance,
        balance_formatted: `¥${agent.balance.toLocaleString()}`,
      });
    }

    // GET /balance - Wallet balance
    if (req.method === "GET" && path === "/balance") {
      return jsonResponse({
        balance: agent.balance,
        formatted: `¥${agent.balance.toLocaleString()}`,
      });
    }

    // GET /skills - Search available skills
    if (req.method === "GET" && path === "/skills") {
      const category = url.searchParams.get("category");
      const search = url.searchParams.get("search");
      const limit = parseInt(url.searchParams.get("limit") || "20");

      let query = supabaseAdmin
        .from("skills")
        .select("id, title, slug, description, price, team_price, enterprise_price, rating_avg, rating_count, download_count, tags, category_id")
        .eq("is_published", true)
        .order("rating_avg", { ascending: false })
        .limit(limit);

      if (category) {
        query = query.eq("category_id", category);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`);
      }

      const { data: skills, error } = await query;

      if (error) {
        return jsonResponse({ error: error.message }, 500);
      }

      return jsonResponse({
        skills: skills.map(s => ({
          ...s,
          price_formatted: `¥${s.price.toLocaleString()}`,
          can_afford: agent.balance >= s.price,
        })),
        total: skills.length,
      });
    }

    // GET /skills/:id - Get skill detail
    if (req.method === "GET" && path.startsWith("/skills/")) {
      const skillId = path.replace("/skills/", "");

      const { data: skill, error } = await supabaseAdmin
        .from("skills")
        .select("id, title, slug, description, long_description, price, team_price, enterprise_price, rating_avg, rating_count, download_count, tags, category_id, version")
        .eq("id", skillId)
        .eq("is_published", true)
        .single();

      if (error || !skill) {
        return jsonResponse({ error: "Skill not found" }, 404);
      }

      // Check if already owned
      const { data: ownership } = await supabaseAdmin
        .from("ai_skill_ownership")
        .select("id")
        .eq("agent_id", agent.id)
        .eq("skill_id", skillId)
        .single();

      return jsonResponse({
        ...skill,
        price_formatted: `¥${skill.price.toLocaleString()}`,
        can_afford: agent.balance >= skill.price,
        already_owned: !!ownership,
      });
    }

    // POST /purchase - Purchase a skill
    if (req.method === "POST" && path === "/purchase") {
      if (!agent.auto_purchase_enabled) {
        return jsonResponse({ error: "Auto-purchase is disabled for this agent" }, 403);
      }

      const body = await req.json();
      const { skill_id, license_type = "personal", reason } = body;

      if (!skill_id) {
        return jsonResponse({ error: "skill_id is required" }, 400);
      }

      // Call the purchase function
      const { data: result, error } = await supabaseAdmin
        .rpc("process_ai_purchase", {
          p_agent_id: agent.id,
          p_skill_id: skill_id,
          p_license_type: license_type,
        });

      if (error) {
        return jsonResponse({ error: error.message }, 500);
      }

      // If approval required, save the reason
      if (result.status === "approval_required" && reason) {
        await supabaseAdmin
          .from("ai_purchase_requests")
          .update({ reason })
          .eq("id", result.request_id);
      }

      return jsonResponse(result);
    }

    // GET /owned - List owned skills
    if (req.method === "GET" && path === "/owned") {
      const { data: owned, error } = await supabaseAdmin
        .from("ai_skill_ownership")
        .select(`
          id,
          skill_id,
          license_type,
          installed_at,
          use_count,
          skill:skills(id, title, slug, version)
        `)
        .eq("agent_id", agent.id)
        .order("installed_at", { ascending: false });

      if (error) {
        return jsonResponse({ error: error.message }, 500);
      }

      return jsonResponse({ skills: owned });
    }

    // GET /owned/:skill_id/content - Get skill content (SKILL.md)
    if (req.method === "GET" && path.match(/^\/owned\/[^/]+\/content$/)) {
      const skillId = path.split("/")[2];

      const { data: ownership, error } = await supabaseAdmin
        .from("ai_skill_ownership")
        .select("skill_md_content, use_count")
        .eq("agent_id", agent.id)
        .eq("skill_id", skillId)
        .single();

      if (error || !ownership) {
        return jsonResponse({ error: "Skill not owned" }, 404);
      }

      // Increment use count
      await supabaseAdmin
        .from("ai_skill_ownership")
        .update({
          use_count: ownership.use_count + 1,
          last_used_at: new Date().toISOString(),
        })
        .eq("agent_id", agent.id)
        .eq("skill_id", skillId);

      return jsonResponse({
        skill_md_content: ownership.skill_md_content,
      });
    }

    // GET /transactions - Wallet history
    if (req.method === "GET" && path === "/transactions") {
      const limit = parseInt(url.searchParams.get("limit") || "50");

      const { data: transactions, error } = await supabaseAdmin
        .from("ai_wallet_transactions")
        .select("id, type, amount, balance_after, description, created_at")
        .eq("agent_id", agent.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        return jsonResponse({ error: error.message }, 500);
      }

      return jsonResponse({ transactions });
    }

    // =====================
    // MARKETPLACE ITEMS API
    // =====================

    // GET /items - Search marketplace items (all types)
    if (req.method === "GET" && path === "/items") {
      const type = url.searchParams.get("type"); // skill, api, model, etc.
      const search = url.searchParams.get("search");
      const limit = parseInt(url.searchParams.get("limit") || "20");

      let query = supabaseAdmin
        .from("marketplace_items")
        .select("id, type, title, slug, description, price_cents, rating_avg, rating_count, download_count, tags, is_verified")
        .eq("is_published", true)
        .order("rating_avg", { ascending: false })
        .limit(limit);

      if (type) {
        query = query.eq("type", type);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data: items, error } = await query;

      if (error) {
        return jsonResponse({ error: error.message }, 500);
      }

      return jsonResponse({
        items: items.map(item => ({
          ...item,
          price_usd: (item.price_cents / 100).toFixed(2),
          can_afford: agent.balance >= item.price_cents,
        })),
        total: items.length,
      });
    }

    // GET /items/:id - Get item detail
    if (req.method === "GET" && path.match(/^\/items\/[^/]+$/) && !path.includes("/content")) {
      const itemId = path.replace("/items/", "");

      const { data: item, error } = await supabaseAdmin
        .from("marketplace_items")
        .select("*")
        .eq("id", itemId)
        .eq("is_published", true)
        .single();

      if (error || !item) {
        return jsonResponse({ error: "Item not found" }, 404);
      }

      // Check if already owned
      const { data: ownership } = await supabaseAdmin
        .from("item_ownership")
        .select("id")
        .eq("agent_id", agent.id)
        .eq("item_id", itemId)
        .single();

      return jsonResponse({
        ...item,
        price_usd: (item.price_cents / 100).toFixed(2),
        can_afford: agent.balance >= item.price_cents,
        already_owned: !!ownership,
      });
    }

    // POST /items/purchase - Purchase a marketplace item
    if (req.method === "POST" && path === "/items/purchase") {
      if (!agent.auto_purchase_enabled) {
        return jsonResponse({ error: "Auto-purchase is disabled for this agent" }, 403);
      }

      const body = await req.json();
      const { item_id, reason } = body;

      if (!item_id) {
        return jsonResponse({ error: "item_id is required" }, 400);
      }

      // Get item
      const { data: item, error: itemError } = await supabaseAdmin
        .from("marketplace_items")
        .select("*")
        .eq("id", item_id)
        .eq("is_published", true)
        .single();

      if (itemError || !item) {
        return jsonResponse({ error: "Item not found" }, 404);
      }

      // Check per-purchase limit
      if (agent.per_purchase_limit && item.price_cents > agent.per_purchase_limit) {
        return jsonResponse({
          error: "Exceeds per-purchase limit",
          limit: agent.per_purchase_limit,
          price: item.price_cents
        }, 403);
      }

      // Check if requires approval
      if (agent.require_approval_above && item.price_cents > agent.require_approval_above) {
        // Create approval request
        const { data: request, error: reqError } = await supabaseAdmin
          .from("ai_purchase_requests")
          .insert({
            agent_id: agent.id,
            skill_id: item_id, // Using skill_id field for items too
            license_type: "personal",
            price: item.price_cents,
            reason: reason || `AI wants to purchase: ${item.title}`,
          })
          .select("id")
          .single();

        if (reqError) {
          return jsonResponse({ error: "Failed to create approval request" }, 500);
        }

        return jsonResponse({
          status: "approval_required",
          request_id: request.id,
          message: "Purchase exceeds auto-approval limit. Human will be notified.",
        });
      }

      // Process purchase with fees
      const { data: result, error: purchaseError } = await supabaseAdmin
        .rpc("process_marketplace_purchase", {
          p_buyer_agent_id: agent.id,
          p_item_id: item_id,
        });

      if (purchaseError) {
        return jsonResponse({ error: purchaseError.message }, 500);
      }

      return jsonResponse(result);
    }

    // GET /items/owned - List owned items
    if (req.method === "GET" && path === "/items/owned") {
      const { data: owned, error } = await supabaseAdmin
        .from("item_ownership")
        .select(`
          id,
          item_id,
          purchase_price_cents,
          purchased_at,
          use_count,
          item:marketplace_items(id, type, title, slug, version, content_md, api_endpoint)
        `)
        .eq("agent_id", agent.id)
        .order("purchased_at", { ascending: false });

      if (error) {
        return jsonResponse({ error: error.message }, 500);
      }

      return jsonResponse({ items: owned });
    }

    // GET /items/owned/:id/content - Get item content
    if (req.method === "GET" && path.match(/^\/items\/owned\/[^/]+\/content$/)) {
      const itemId = path.split("/")[3];

      const { data: ownership, error } = await supabaseAdmin
        .from("item_ownership")
        .select(`
          use_count,
          item:marketplace_items(content_md, api_endpoint, content_url, model_url)
        `)
        .eq("agent_id", agent.id)
        .eq("item_id", itemId)
        .single();

      if (error || !ownership) {
        return jsonResponse({ error: "Item not owned" }, 404);
      }

      // Increment use count
      await supabaseAdmin
        .from("item_ownership")
        .update({
          use_count: ownership.use_count + 1,
          last_used_at: new Date().toISOString(),
        })
        .eq("agent_id", agent.id)
        .eq("item_id", itemId);

      return jsonResponse({
        content_md: ownership.item.content_md,
        api_endpoint: ownership.item.api_endpoint,
        content_url: ownership.item.content_url,
        model_url: ownership.item.model_url,
      });
    }

    // =====================
    // SELLER API (AI can sell too!)
    // =====================

    // POST /sell - List an item for sale
    if (req.method === "POST" && path === "/sell") {
      const body = await req.json();
      const { type, title, description, price_cents, content_md, api_endpoint, tags } = body;

      if (!type || !title || !description || !price_cents) {
        return jsonResponse({
          error: "Required: type, title, description, price_cents"
        }, 400);
      }

      const validTypes = ["skill", "api", "model", "lora", "prompt", "data", "compute", "agent_hire"];
      if (!validTypes.includes(type)) {
        return jsonResponse({ error: `Invalid type. Must be one of: ${validTypes.join(", ")}` }, 400);
      }

      // Generate slug
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") + "-" + Date.now().toString(36);

      const { data: item, error } = await supabaseAdmin
        .from("marketplace_items")
        .insert({
          seller_id: agent.owner_id,
          seller_agent_id: agent.id,
          type,
          title,
          slug,
          description,
          price_cents,
          content_md: content_md || null,
          api_endpoint: api_endpoint || null,
          tags: tags || [],
          is_published: true, // AI-listed items go live immediately (moderated by AI later)
        })
        .select("id, slug")
        .single();

      if (error) {
        return jsonResponse({ error: error.message }, 500);
      }

      return jsonResponse({
        status: "success",
        item_id: item.id,
        slug: item.slug,
        message: "Item listed successfully",
      });
    }

    // GET /sell/my-items - List items I'm selling
    if (req.method === "GET" && path === "/sell/my-items") {
      const { data: items, error } = await supabaseAdmin
        .from("marketplace_items")
        .select("id, type, title, slug, price_cents, download_count, rating_avg, is_published, created_at")
        .eq("seller_agent_id", agent.id)
        .order("created_at", { ascending: false });

      if (error) {
        return jsonResponse({ error: error.message }, 500);
      }

      return jsonResponse({ items });
    }

    // =====================
    // APPROVAL REQUESTS
    // =====================

    // GET /requests - List my pending approval requests
    if (req.method === "GET" && path === "/requests") {
      const { data: requests, error } = await supabaseAdmin
        .from("ai_purchase_requests")
        .select("id, skill_id, price, reason, status, created_at, expires_at")
        .eq("agent_id", agent.id)
        .order("created_at", { ascending: false });

      if (error) {
        return jsonResponse({ error: error.message }, 500);
      }

      return jsonResponse({ requests });
    }

    return jsonResponse({ error: "Not found" }, 404);

  } catch (error) {
    console.error("AI API error:", error);
    return jsonResponse({ error: error.message }, 500);
  }
});

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
