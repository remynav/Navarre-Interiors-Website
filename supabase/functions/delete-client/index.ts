import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientId } = await req.json();
    if (!clientId) {
      return new Response(JSON.stringify({ error: "clientId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    // Verify caller is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdminRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!isAdminRow) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Deleting client:", clientId);

    // Fetch project ids for this client
    const { data: projects } = await admin
      .from("projects")
      .select("id")
      .eq("client_id", clientId);
    const projectIds = (projects ?? []).map((p) => p.id);

    if (projectIds.length > 0) {
      // Mood boards under these projects
      const { data: boards } = await admin
        .from("mood_boards")
        .select("id")
        .in("project_id", projectIds);
      const boardIds = (boards ?? []).map((b) => b.id);

      if (boardIds.length > 0) {
        // Design items + their comments
        const { data: items } = await admin
          .from("design_items")
          .select("id")
          .in("mood_board_id", boardIds);
        const itemIds = (items ?? []).map((i) => i.id);
        if (itemIds.length > 0) {
          await admin
            .from("design_item_comments")
            .delete()
            .in("design_item_id", itemIds);
        }
        await admin.from("design_items").delete().in("mood_board_id", boardIds);
        await admin
          .from("mood_board_images")
          .delete()
          .in("mood_board_id", boardIds);
        await admin
          .from("client_board_images")
          .delete()
          .in("mood_board_id", boardIds);
        await admin
          .from("board_products")
          .delete()
          .in("mood_board_id", boardIds);
        await admin.from("mood_boards").delete().in("project_id", projectIds);
      }

      // Renderings + their comments
      const { data: renderings } = await admin
        .from("renderings")
        .select("id")
        .in("project_id", projectIds);
      const renderingIds = (renderings ?? []).map((r) => r.id);
      if (renderingIds.length > 0) {
        await admin
          .from("rendering_comments")
          .delete()
          .in("rendering_id", renderingIds);
      }
      await admin.from("renderings").delete().in("project_id", projectIds);

      await admin.from("messages").delete().in("project_id", projectIds);
      await admin.from("documents").delete().in("project_id", projectIds);
      await admin.from("milestones").delete().in("project_id", projectIds);
      await admin.from("orders").delete().in("project_id", projectIds);
      await admin.from("budget_items").delete().in("project_id", projectIds);
      await admin.from("projects").delete().in("id", projectIds);
    }

    // User-scoped data
    await admin.from("product_favorites").delete().eq("user_id", clientId);
    await admin.from("notifications").delete().eq("user_id", clientId);
    await admin.from("user_roles").delete().eq("user_id", clientId);
    await admin.from("profiles").delete().eq("id", clientId);

    // Finally, the auth user
    const { error: authDelErr } = await admin.auth.admin.deleteUser(clientId);
    if (authDelErr) {
      console.error("Auth delete error:", authDelErr);
      return new Response(
        JSON.stringify({
          error: "Failed to delete auth user",
          details: authDelErr.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("delete-client error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
