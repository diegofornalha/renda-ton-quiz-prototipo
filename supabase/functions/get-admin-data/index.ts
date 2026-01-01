import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { verify } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT token from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Token não fornecido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");
    const jwtSecret = Deno.env.get("JWT_SECRET") || adminPassword;

    if (!jwtSecret) {
      return new Response(
        JSON.stringify({ error: "Configuração de segurança ausente" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the JWT token
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(jwtSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );

    try {
      const payload = await verify(token, key);
      
      if (payload.role !== "admin") {
        return new Response(
          JSON.stringify({ error: "Acesso não autorizado" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch {
      return new Response(
        JSON.stringify({ error: "Token inválido ou expirado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role key to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch quiz questions count
    const { count: questionsCount } = await supabase
      .from("quiz_questions")
      .select("*", { count: "exact", head: true });

    // Fetch all quiz results
    const { data: results, error: resultsError } = await supabase
      .from("quiz_results")
      .select("*")
      .order("score", { ascending: false })
      .order("completed_at", { ascending: false });

    if (resultsError) {
      throw resultsError;
    }

    // Fetch quiz settings
    const { data: settings, error: settingsError } = await supabase
      .from("quiz_settings")
      .select("*");

    if (settingsError) {
      throw settingsError;
    }

    return new Response(
      JSON.stringify({
        questionsCount: questionsCount || 0,
        results: results || [],
        settings: settings || [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get-admin-data:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao buscar dados" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
