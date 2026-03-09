import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const shortCode = url.searchParams.get("code");

    if (!shortCode) {
      return new Response(JSON.stringify({ error: "Missing code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Look up the link
    const { data: link, error: linkError } = await supabase
      .from("links")
      .select("id, destination_url, user_id, clicks")
      .eq("short_code", shortCode)
      .eq("status", "active")
      .maybeSingle();

    if (linkError || !link) {
      return new Response(JSON.stringify({ error: "Link not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse user agent for device/browser/os
    const userAgent = req.headers.get("user-agent") || "";
    const referrer = req.headers.get("referer") || null;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

    let device = "Desktop";
    if (/mobile|android|iphone/i.test(userAgent)) device = "Mobile";
    else if (/tablet|ipad/i.test(userAgent)) device = "Tablet";

    let browser = "Other";
    if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) browser = "Chrome";
    else if (/firefox/i.test(userAgent)) browser = "Firefox";
    else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = "Safari";
    else if (/edg/i.test(userAgent)) browser = "Edge";

    let os = "Other";
    if (/windows/i.test(userAgent)) os = "Windows";
    else if (/mac/i.test(userAgent)) os = "macOS";
    else if (/linux/i.test(userAgent)) os = "Linux";
    else if (/android/i.test(userAgent)) os = "Android";
    else if (/iphone|ipad/i.test(userAgent)) os = "iOS";

    // Record click event and increment counter in parallel
    await Promise.all([
      supabase.from("click_events").insert({
        link_id: link.id,
        user_id: link.user_id,
        device,
        browser,
        os,
        referrer,
        ip_address: ip,
      }),
      supabase
        .from("links")
        .update({ clicks: (link.clicks || 0) + 1 })
        .eq("id", link.id),
    ]);

    // Redirect
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, Location: link.destination_url },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
