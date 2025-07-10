import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get form data
    const formData = await req.formData()
    const image = formData.get('image') as File
    const type = formData.get('type') as string

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate file type
    if (!image.type.startsWith('image/')) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Please upload an image.' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (image.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'Image size must be less than 10MB' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get Cloudflare credentials from environment
    const cfAccountId = Deno.env.get('CF_ACCOUNT_ID')
    const cfApiToken = Deno.env.get('CF_API_TOKEN')
    const cfImgBase = Deno.env.get('CF_IMG_BASE')

    if (!cfAccountId || !cfApiToken) {
      console.error('Missing Cloudflare credentials')
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const extension = image.name.split('.').pop() || 'jpg'
    const filename = `meals/${user.id}/${timestamp}.${extension}`

    // Create form data for Cloudflare
    const cfFormData = new FormData()
    cfFormData.append('file', image)
    cfFormData.append('id', filename)

    // Upload to Cloudflare Images
    const cfResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cfApiToken}`,
        },
        body: cfFormData,
      }
    )

    const cfData = await cfResponse.json()

    if (!cfResponse.ok || !cfData.success) {
      console.error('Cloudflare upload error:', cfData.errors)
      return new Response(
        JSON.stringify({ 
          error: cfData.errors?.[0]?.message || 'Failed to upload image to Cloudflare' 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Construct the public URL with correct format
    // Format: https://imagedelivery.net/{account_hash}/{image_id}/{variant_name}
    const imageUrl = `${cfImgBase}/${cfData.result.id}/public`

    // Optionally, save image metadata to Supabase
    const { error: dbError } = await supabaseClient
      .from('meal_images')
      .insert({
        user_id: user.id,
        cloudflare_id: cfData.result.id,
        image_url: imageUrl,
        filename: image.name,
        file_size: image.size,
        mime_type: image.type,
      })

    if (dbError) {
      console.error('Database error (non-critical):', dbError)
      // Don't fail the request if DB insert fails
    }

    return new Response(
      JSON.stringify({
        url: imageUrl,
        id: cfData.result.id,
        success: true
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})