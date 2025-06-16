// supabase/functions/stream-video/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://esm.sh/zod@3.22.4'

// Zod schema for response validation (remains the same)
const PlayResponseSchema = z.object({
  url: z.string().url(),
  loop: z.boolean(),
})
type PlayResponseType = z.infer<typeof PlayResponseSchema>

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

// --- Utility functions from Cloudflare JWK signing example ---
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function objectToBase64url(payload: object): string {
  return arrayBufferToBase64Url(
    new TextEncoder().encode(JSON.stringify(payload)),
  );
}
// --- End of utility functions ---

serve(async (req: Request) => {
  console.log(`Request received: ${req.method} ${req.url}`);

  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  // const videoUIDFromQuery = url.searchParams.get("videoUID"); // Keep this if you pass videoUID as query param
  
  // If you are getting videoUID from path like before:
  const pathParts = url.pathname.split('/')
  const exerciseIdFromPath = pathParts[pathParts.length - 1] // Assuming last part is exerciseId or videoUID

  // Determine which video identifier to use: query param or path.
  // For now, let's assume it's coming from the path as per your previous structure
  // and that exerciseIdFromPath IS the videoUID or can be used to fetch it.
  // If you switch to videoUID query param, adjust this logic.
  const exerciseId = exerciseIdFromPath;


  if (!exerciseId || exerciseId === 'stream-video') { // Adjust if using query param
    console.error('Exercise ID (or Video UID) is required in the path.');
    return new Response(JSON.stringify({ error: 'Exercise ID (or Video UID) is required' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }

  try {
    // --- Supabase client and user auth (remains similar) ---
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      console.error('User auth error:', userError?.message)
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 })
    }
    // --- End Supabase client and user auth ---

    // --- Fetch video UID from exrcwiki (remains similar) ---
    const { data: exerciseData, error: dbError } = await supabaseClient
      .from('exrcwiki')
      .select('cf_video_uid')
      .eq('exercise_id', exerciseId) // Assuming exerciseId is used to fetch cf_video_uid
      .single()

    if (dbError || !exerciseData || !exerciseData.cf_video_uid) {
      console.error('DB error or exercise not found/no UID:', dbError?.message)
      return new Response(JSON.stringify({ error: 'Exercise not found or video UID missing' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 })
    }
    const cfVideoStreamUID = exerciseData.cf_video_uid;
    // --- End fetch video UID ---


    // --- Environment variables for Cloudflare Stream ---
    const keyId = Deno.env.get("CF_STREAM_KEY_ID");
    const tokenTtlSeconds = parseInt(Deno.env.get("CF_STREAM_TOKEN_TTL") || "3600", 10);
    // IMPORTANT: CF_STREAM_SIGN_KEY now holds the BASE64 ENCODED JWK string
    const b64EncodedJwk = Deno.env.get("CF_STREAM_SIGN_KEY"); 
    const cfStreamDelivery = Deno.env.get("CF_STREAM_DELIVERY");

    if (!keyId || !b64EncodedJwk || !cfStreamDelivery) {
      console.error("[stream-video] Missing Cloudflare Stream environment variables. Required: CF_STREAM_KEY_ID, CF_STREAM_SIGN_KEY (as base64 JWK), CF_STREAM_DELIVERY");
      return new Response(JSON.stringify({ error: "Stream configuration error on server." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // --- End Environment variables ---

    let signedToken = "";
    try {
      // --- JWK processing and JWT signing ---
      const jwkString = atob(b64EncodedJwk); // Decode base64 to get JSON string
      const jwkObject = JSON.parse(jwkString);   // Parse JSON string to JWK object

      const cryptoKey = await crypto.subtle.importKey(
        "jwk",
        jwkObject,
        {
          name: "RSASSA-PKCS1-v1_5", // Algorithm from JWK
          hash: "SHA-256",           // Hash from JWK (usually SHA-256 for RS256)
        },
        false, // not extractable
        ["sign"]
      );
      console.log("[stream-video] Successfully imported JWK.");

      const encoder = new TextEncoder();
      const nowSeconds = Math.floor(Date.now() / 1000);
      const exp = nowSeconds + tokenTtlSeconds; 
      const nbf = nowSeconds - 60; // Optional: Not before, for clock skew

      const header = {
        alg: "RS256", // Algorithm from JWK
        kid: keyId,
        typ: "JWT" // Standard JWT type
      };

      const payload = {
        sub: cfVideoStreamUID,
        kid: keyId, // Cloudflare examples include kid in payload too
        exp: exp,
        nbf: nbf,
        accessRules: [
          // Adjust access rules as needed, e.g., based on Cloudflare example
          { type: "any", action: "allow" }, 
          // { type: "ip.geoip.country", action: "allow", country: ["GB"] },
          // { type: "any", action: "block" } // if you want to block others
           { type: 'public', action: 'block', name: 'download' } // Blocks direct download access
        ],
      };
      
      console.log("[stream-video] Attempting to sign JWT with payload:", JSON.stringify(payload), "and header:", JSON.stringify(header));

      const tokenToSign = `${objectToBase64url(header)}.${objectToBase64url(payload)}`;
      
      const signatureBuffer = await crypto.subtle.sign(
        { name: "RSASSA-PKCS1-v1_5" }, // Algorithm from JWK
        cryptoKey,
        encoder.encode(tokenToSign)
      );

      signedToken = `${tokenToSign}.${arrayBufferToBase64Url(signatureBuffer)}`;
      console.log("[stream-video] Successfully signed JWT using JWK.");
      // --- End JWK processing and JWT signing ---

    } catch (jwtError) {
      console.error("[stream-video] Error processing JWK or signing JWT:", jwtError, jwtError.stack ? jwtError.stack : '(no stack)');
      if (jwtError.message.includes("JSON.parse")) {
        console.error("[stream-video] The CF_STREAM_SIGN_KEY (base64 JWK) might not be a valid base64 encoded JSON string, or the decoded JSON is not a valid JWK.");
      }
      return new Response(JSON.stringify({ error: "Failed to sign video token.", details: jwtError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const videoUrl = `${cfStreamDelivery}/${signedToken}/manifest/video.m3u8`;
    const responsePayload: PlayResponseType = { url: videoUrl, loop: true }; // Assuming loop is always true
    
    // Validate the final response object (good practice)
    const validatedResponse = PlayResponseSchema.parse(responsePayload);
    console.log(`[stream-video] Successfully generated signed URL for ${cfVideoStreamUID}: ${videoUrl.substring(0, videoUrl.lastIndexOf('/'))}/...`);

    return new Response(JSON.stringify(validatedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in stream-video function:', error.message, error.stack)
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: 'Failed to validate response', details: error.errors }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 })
    }
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 })
  }
})