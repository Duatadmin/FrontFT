// supabase/functions/stream-video/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import jwt from 'https://esm.sh/jsonwebtoken@9.0.2' // Ensure this is the correct ESM import for Deno
import { z } from 'https://esm.sh/zod@3.22.4'

// Define the Zod schema for the response (consistent with src/types/video.ts)
const PlayResponseSchema = z.object({
  url: z.string().url(),
  loop: z.boolean(),
})
type PlayResponseType = z.infer<typeof PlayResponseSchema>

// CORS headers - adjust origin as needed for your frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Or specific origin: 'http://localhost:5173'
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

serve(async (req: Request) => {
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const pathParts = url.pathname.split('/') // Expected: /stream-video/0001
  const exerciseId = pathParts[pathParts.length - 1]

  if (!exerciseId || exerciseId === 'stream-video') { // Check if exerciseId is missing or is the function name itself
    return new Response(JSON.stringify({ error: 'Exercise ID is required in the path (e.g., /stream-video/your-exercise-id)' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }

  try {
    // Create a Supabase client with the user's auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      console.error('User auth error:', userError)
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }
    // const userId = user.id // userId is available if needed for logging or other logic

    const useLocalMedia = Deno.env.get('USE_LOCAL_MEDIA') === 'true'

    if (useLocalMedia) {
      const projectUrl = Deno.env.get('SUPABASE_PROJECT_URL') || Deno.env.get('SITE_URL') || 'http://localhost:5173';
      const localUrl = `${projectUrl}/media/${exerciseId}.mp4`
      
      const validatedResponse = PlayResponseSchema.parse({ url: localUrl, loop: true })
      return new Response(JSON.stringify(validatedResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const { data: exerciseData, error: dbError } = await supabaseClient
      .from('exrcwiki')
      .select('cf_video_uid')
      .eq('exercise_id', exerciseId)
      .single()

    if (dbError || !exerciseData || !exerciseData.cf_video_uid) {
      console.error('DB error or exercise not found/no UID:', dbError?.message, exerciseData)
      return new Response(JSON.stringify({ error: 'Exercise not found or video UID missing for ID: ' + exerciseId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    const cfVideoUid = exerciseData.cf_video_uid
    const keyId = Deno.env.get('CF_STREAM_KEY_ID')
    const signKey = Deno.env.get('CF_STREAM_SIGN_KEY') 
    const deliveryHost = Deno.env.get('CF_STREAM_DELIVERY') || 'https://videodelivery.net'
    const tokenTtl = parseInt(Deno.env.get('CF_STREAM_TOKEN_TTL') || '3600', 10)

    if (!keyId || !signKey) {
      console.error('Cloudflare Stream signing key ID or secret key is not configured.')
      return new Response(JSON.stringify({ error: 'Server configuration error for video streaming.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }
    
    const expiry = Math.floor(Date.now() / 1000) + tokenTtl
    const unsignedToken = {
      sub: cfVideoUid, 
      kid: keyId,
      exp: expiry,
    }

    const signedJwt = jwt.sign(unsignedToken, signKey, { algorithm: 'HS256', header: { kid: keyId } })
    const streamUrl = `${deliveryHost}/${cfVideoUid}/manifest/video.m3u8?token=${signedJwt}`
    
    const responsePayload: PlayResponseType = { url: streamUrl, loop: true }
    const validatedResponse = PlayResponseSchema.parse(responsePayload)

    return new Response(JSON.stringify(validatedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in Supabase function stream-video:', error.message, error.stack)
    if (error.name === 'JsonWebTokenError' || (error.message && error.message.includes('invalid signature'))) { 
         return new Response(JSON.stringify({ error: 'Failed to sign video token' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: 'Failed to validate response', details: error.errors }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
