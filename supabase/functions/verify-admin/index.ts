import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { create } from "https://deno.land/x/djwt@v2.8/mod.ts";

const allowedOrigins = [
  "https://uobqtfcqfcfmllgblsrs.lovableproject.com",
  "http://localhost:5173",
  "http://localhost:8080",
];

function getCorsHeaders(origin: string | null) {
  const isAllowed = origin && allowedOrigins.includes(origin);
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "null",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

// Simple in-memory rate limiting (per isolate)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 300000; // 5 minutes
const MAX_ATTEMPTS = 5;

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }
  
  if (record.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }
  
  record.count++;
  return { allowed: true };
}

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting check
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rateCheck = checkRateLimit(clientIp);
  
  if (!rateCheck.allowed) {
    console.log(`Rate limit exceeded for IP: ${clientIp}`);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Muitas tentativas. Tente novamente em ${Math.ceil(rateCheck.retryAfter! / 60)} minutos.` 
      }),
      { 
        status: 429, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Retry-After": String(rateCheck.retryAfter)
        } 
      }
    );
  }

  try {
    const { password } = await req.json();
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");
    const jwtSecret = Deno.env.get("JWT_SECRET");

    if (!adminPassword) {
      console.error("ADMIN_PASSWORD not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Configuração de segurança ausente" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!jwtSecret) {
      console.error("JWT_SECRET not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Configuração de segurança ausente" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (password === adminPassword) {
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(jwtSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
      );

      const token = await create(
        { alg: "HS256", typ: "JWT" },
        { 
          role: "admin",
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000)
        },
        key
      );

      return new Response(
        JSON.stringify({ success: true, token }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Add delay after failed attempt to slow down brute force
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Failed login attempt from IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ success: false, error: "Senha incorreta" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in verify-admin:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Erro ao processar requisição" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
