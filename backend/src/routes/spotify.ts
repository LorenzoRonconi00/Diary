import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  preview_url?: string;
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
  };
}

// Cache del token
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

async function getSpotifyToken(): Promise<string> {
  // Controlla se il token è ancora valido
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log('🔄 Using cached Spotify token');
    return cachedToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  console.log('🔑 Getting new Spotify token...');
  console.log('Client ID exists:', !!clientId);
  console.log('Client Secret exists:', !!clientSecret);

  if (!clientId || !clientSecret) {
    console.error('❌ Missing Spotify credentials');
    throw new Error('Spotify credentials not configured');
  }

  try {
    const authString = `${clientId}:${clientSecret}`;
    const authBase64 = Buffer.from(authString).toString('base64');

    console.log('📡 Making request to Spotify token endpoint...');

    const response = await axios.post<SpotifyTokenResponse>(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials', // ✨ BODY come string
      {
        headers: {
          'Authorization': `Basic ${authBase64}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000, // 10 secondi timeout
      }
    );

    console.log('✅ Spotify token received successfully');
    console.log('Token type:', response.data.token_type);
    console.log('Expires in:', response.data.expires_in, 'seconds');

    cachedToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // 1 minuto di buffer

    return cachedToken!;
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      console.error('❌ Spotify token error:', (error as any).response?.data || (error as any).message);
    } else {
      console.error('❌ Spotify token error:', error instanceof Error ? error.message : String(error));
    }
    if (typeof error === 'object' && error !== null && 'response' in error && (error as any).response) {
      if ('status' in (error as any).response) {
        console.error('Response status:', (error as any).response.status);
        console.error('Response data:', (error as any).response.data);
      }
    }
    const errorMessage = (error instanceof Error) ? error.message : String(error);
    throw new Error(`Failed to get Spotify access token: ${errorMessage}`);
  }
}

router.get('/test-token', async (req: Request, res: Response) => {
  try {
    const token = await getSpotifyToken();
    res.json({ 
      success: true, 
      tokenExists: !!token,
      tokenPrefix: token.substring(0, 20) + '...'
    });
  } catch (error) {
    console.error('Test token error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    console.log('🔍 Searching Spotify for:', q);

    const token = await getSpotifyToken();

    console.log('📡 Making search request to Spotify API...');

    const response = await axios.get<SpotifySearchResponse>(
      'https://api.spotify.com/v1/search',
      {
        params: {
          q: q.trim(),
          type: 'track',
          limit: Math.min(Number(limit), 50),
          market: 'IT',
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000, // 15 secondi timeout
      }
    );

    console.log('✅ Search completed, found', response.data.tracks.items.length, 'tracks');

    res.json(response.data);
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'response' in error && (error as any).response) {
      console.error('❌ Spotify search error:', (error as any).response.data || (error as any).message);
    } else {
      console.error('❌ Spotify search error:', (error as any)?.message || String(error));
    }
    if (typeof error === 'object' && error !== null && 'response' in error && (error as any).response) {
      console.error('Response status:', (error as any).response.status);
      console.error('Response data:', (error as any).response.data);
    }
    let details: any = '';
    if (typeof error === 'object' && error !== null) {
      if ('response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
        details = (error as any).response.data;
      } else if ('message' in error) {
        details = (error as any).message;
      }
    } else {
      details = String(error);
    }
    res.status(500).json({ 
      error: 'Failed to search Spotify tracks',
      details
    });
  }
});

router.get('/debug', async (req: Request, res: Response) => {
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    
    console.log('=== SPOTIFY DEBUG ===');
    console.log('Client ID exists:', !!clientId);
    console.log('Client ID (first 8 chars):', clientId?.substring(0, 8) + '...');
    console.log('Client Secret exists:', !!clientSecret);
    console.log('Client Secret (first 8 chars):', clientSecret?.substring(0, 8) + '...');
    
    res.json({
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      clientIdLength: clientId?.length || 0,
      clientSecretLength: clientSecret?.length || 0,
      envKeys: Object.keys(process.env).filter(k => k.includes('SPOTIFY')),
      cachedTokenExists: !!cachedToken,
      tokenExpiry: tokenExpiry ? new Date(tokenExpiry).toISOString() : null
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

export default router;
