import { getCurrentUserId } from '@/lib/supabase';

interface UploadResponse {
  success: boolean;
  imageUrl?: string;
  publicId?: string;
  error?: string;
}

interface CloudflareUploadResponse {
  result: {
    id: string;
    filename: string;
    uploaded: string;
    requireSignedURLs: boolean;
    variants: string[];
  };
  success: boolean;
  errors: any[];
  messages: any[];
}

export class CloudflareUploadService {
  private static instance: CloudflareUploadService;
  private accountId: string;
  private apiToken: string;
  private imagesApiUrl: string;
  private baseUrl: string;

  private constructor() {
    // These would typically come from environment variables
    this.accountId = import.meta.env.VITE_CF_ACCOUNT_ID || '';
    this.apiToken = import.meta.env.VITE_CF_API_TOKEN || '';
    this.baseUrl = import.meta.env.VITE_CF_IMG_BASE || '';
    this.imagesApiUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images/v1`;
  }

  static getInstance(): CloudflareUploadService {
    if (!CloudflareUploadService.instance) {
      CloudflareUploadService.instance = new CloudflareUploadService();
    }
    return CloudflareUploadService.instance;
  }

  /**
   * Generate a timestamped filename for the uploaded image
   */
  private generateFilename(originalName: string): string {
    const userId = getCurrentUserId() || 'anonymous';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = originalName.split('.').pop() || 'jpg';
    return `meals/${userId}/${timestamp}.${extension}`;
  }

  /**
   * Upload image directly to Cloudflare Images
   * NOTE: This method will fail in browser due to CORS restrictions.
   * Use uploadViaServer() instead for browser environments.
   */
  async uploadImage(file: File): Promise<UploadResponse> {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          error: 'Please select a valid image file',
        };
      }

      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'Image size must be less than 10MB',
        };
      }

      const filename = this.generateFilename(file.name);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('id', filename);

      // Direct upload to Cloudflare Images
      const response = await fetch(this.imagesApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
        body: formData,
      });

      const data: CloudflareUploadResponse = await response.json();

      if (!response.ok || !data.success) {
        console.error('Cloudflare upload error:', data.errors);
        return {
          success: false,
          error: data.errors?.[0]?.message || 'Failed to upload image',
        };
      }

      // Construct the public URL
      const imageUrl = `${this.baseUrl}/${data.result.id}/public`;

      return {
        success: true,
        imageUrl,
        publicId: data.result.id,
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: 'Failed to upload image. Please try again.',
      };
    }
  }

  /**
   * Upload image via Supabase Edge Function
   */
  async uploadViaServer(file: File): Promise<UploadResponse> {
    try {
      // Import Supabase client
      const { supabase } = await import('@/lib/supabase');
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return {
          success: false,
          error: 'Please sign in to upload images',
        };
      }

      // Validate file
      if (!file.type.startsWith('image/')) {
        return {
          success: false,
          error: 'Please select a valid image file',
        };
      }

      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return {
          success: false,
          error: 'Image size must be less than 10MB',
        };
      }

      const formData = new FormData();
      formData.append('image', file);
      formData.append('type', 'meal');

      // Get Supabase URL and anon key
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Call Supabase Edge Function
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        return {
          success: false,
          error: errorData.error || 'Failed to upload image',
        };
      }

      const data = await response.json();
      return {
        success: true,
        imageUrl: data.url,
        publicId: data.id,
      };
    } catch (error) {
      console.error('Server upload error:', error);
      return {
        success: false,
        error: 'Failed to upload image. Please try again.',
      };
    }
  }

  /**
   * Get image URL with variant
   * Format: https://imagedelivery.net/{account_hash}/{image_id}/{variant_name}
   */
  getImageUrl(publicId: string, variant: 'thumbnail' | 'public' | 'blur' = 'public'): string {
    return `${this.baseUrl}/${publicId}/${variant}`;
  }
}

// Export singleton instance
export const cloudflareUpload = CloudflareUploadService.getInstance();