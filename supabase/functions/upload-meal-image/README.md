# Upload Meal Image Edge Function

This Supabase Edge Function handles secure image uploads to Cloudflare Images for the nutrition tracking feature.

## Setup

1. **Deploy the Edge Function**:
   ```bash
   supabase functions deploy upload-meal-image
   ```

2. **Set Environment Variables** in Supabase Dashboard:
   - Go to Project Settings > Edge Functions > Secrets
   - Add the following secrets:
     - `CF_ACCOUNT_ID`: Your Cloudflare account ID
     - `CF_API_TOKEN`: Your Cloudflare API token with Images:Edit permission
     - `CF_IMG_BASE`: Your Cloudflare Images delivery URL (e.g., https://imagedelivery.net/your-hash)

3. **Apply Database Migration**:
   ```bash
   supabase db push
   ```

## Usage

The function accepts POST requests with:
- `image`: The image file to upload
- `type`: Type of upload (e.g., "meal")

Returns:
- `url`: The public URL of the uploaded image
- `id`: The Cloudflare image ID

## Security

- Requires authenticated user (checks Authorization header)
- Validates file type (must be image/*)
- Validates file size (max 10MB)
- Stores metadata in Supabase with RLS policies

## Testing

```javascript
// Example usage from frontend
const formData = new FormData();
formData.append('image', file);
formData.append('type', 'meal');

const response = await fetch(
  `${supabaseUrl}/functions/v1/upload-meal-image`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': supabaseAnonKey,
    },
    body: formData,
  }
);
```