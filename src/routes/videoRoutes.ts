import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '@/lib/supabase/server'; // Assuming server client is exported from here
import { PlayResponseSchema, PlayResponseType } from '@/types/video';

const router = express.Router();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    // other user properties...
  };
}

router.get('/:exerciseId/play', async (req: AuthenticatedRequest, res: Response) => {
  const { exerciseId } = req.params;
  const userId = req.user?.id; // Placeholder for actual user ID retrieval

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const useLocalMedia = process.env.USE_LOCAL_MEDIA === 'true';

  if (useLocalMedia) {
    // Construct local media URL (adjust path as needed)
    const localUrl = `/media/${exerciseId}.mp4`; 
    try {
      const validatedResponse = PlayResponseSchema.parse({ url: localUrl, loop: true });
      return res.json(validatedResponse);
    } catch (error) {
      console.error('Error validating local media response:', error);
      return res.status(500).json({ error: 'Internal server error during local media response validation' });
    }
  }

  try {
    const { data: exerciseData, error: dbError } = await supabase
      .from('exrcwiki')
      .select('cf_video_uid')
      .eq('exercise_id', exerciseId)
      .single();

    if (dbError || !exerciseData || !exerciseData.cf_video_uid) {
      console.error('DB error or exercise not found/no UID:', dbError);
      return res.status(404).json({ error: 'Exercise not found or video UID missing' });
    }

    const cfVideoUid = exerciseData.cf_video_uid;
    const keyId = process.env.CF_STREAM_KEY_ID;
    const signKey = process.env.CF_STREAM_SIGN_KEY;
    const deliveryHost = process.env.CF_STREAM_DELIVERY || 'https://videodelivery.net';
    const tokenTtl = parseInt(process.env.CF_STREAM_TOKEN_TTL || '3600', 10);

    if (!keyId || !signKey) {
      console.error('Cloudflare Stream signing key ID or secret key is not configured.');
      return res.status(500).json({ error: 'Server configuration error for video streaming.' });
    }

    const expiry = Math.floor(Date.now() / 1000) + tokenTtl;
    const unsignedToken = {
      sub: cfVideoUid, // Per Cloudflare docs, sub should be the video UID for signed URLs
      kid: keyId,
      exp: expiry,
      // According to Cloudflare docs, for viewing permissions, we can also add 'accessRules'
      // For this use case, 'sub' being the video UID and 'kid' being the key ID is standard.
      // If 'userId' is needed for auditing on Cloudflare's side, it might be part of a different setup or custom logging.
      // The prompt mentioned payload { sub:userId, kid:uid, exp:now+TTL }, but CF docs for signed URLs use sub: videoUID.
      // Let's stick to CF docs for `sub: cfVideoUid` for the signed URL to work correctly.
      // If `userId` is strictly required in the token for other reasons, we might need to adjust.
    };

    const signedJwt = jwt.sign(unsignedToken, signKey, { algorithm: 'HS256', header: { kid: keyId } });

    const streamUrl = `${deliveryHost}/${cfVideoUid}/manifest/video.m3u8?token=${signedJwt}`;
    
    const responsePayload: PlayResponseType = { url: streamUrl, loop: true };
    const validatedResponse = PlayResponseSchema.parse(responsePayload);

    return res.json(validatedResponse);

  } catch (error) {
    console.error('Error generating Cloudflare Stream URL:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(500).json({ error: 'Failed to sign video token' });
    }
    if (error instanceof z.ZodError) {
      return res.status(500).json({ error: 'Failed to validate response', details: error.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
