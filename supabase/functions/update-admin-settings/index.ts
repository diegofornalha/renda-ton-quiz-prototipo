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

    // Parse request body
    const { timerEnabled, timerSeconds } = await req.json();

    // Validate inputs
    if (typeof timerEnabled !== "boolean") {
      return new Response(
        JSON.stringify({ error: "timerEnabled deve ser boolean" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof timerSeconds !== "number" || timerSeconds < 30 || timerSeconds > 600) {
      return new Response(
        JSON.stringify({ error: "timerSeconds deve ser entre 30 e 600" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role key to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update settings
    const updatedAt = new Date().toISOString();

    const { error: timerEnabledError } = await supabase
      .from("quiz_settings")
      .update({ value: timerEnabled.toString(), updated_at: updatedAt })
      .eq("key", "timer_enabled");

    if (timerEnabledError) throw timerEnabledError;

    const { error: timerSecondsError } = await supabase
      .from("quiz_settings")
      .update({ value: timerSeconds.toString(), updated_at: updatedAt })
      .eq("key", "timer_seconds");

    if (timerSecondsError) throw timerSecondsError;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in update-admin-settings:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao salvar configurações" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
