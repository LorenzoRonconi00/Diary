import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

interface GiphySticker {
  id: string;
  title: string;
  images: {
    fixed_height: {
      url: string;
      width: string;
      height: string;
    };
    fixed_height_small: {
      url: string;
      width: string;
      height: string;
    };
    original: {
      url: string;
      width: string;
      height: string;
    };
  };
}

interface GiphySearchResponse {
  data: GiphySticker[];
  pagination: {
    total_count: number;
    count: number;
    offset: number;
  };
}

// ✨ Endpoint per cercare sticker
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, limit = 20, offset = 0 } = req.query;
    const apiKey = process.env.GIPHY_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Giphy API key not configured' });
    }

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    console.log('🎨 Searching Giphy stickers for:', q);

    const response = await axios.get<GiphySearchResponse>(
      'https://api.giphy.com/v1/stickers/search',
      {
        params: {
          api_key: apiKey,
          q: q.trim(),
          limit: Math.min(Number(limit), 50),
          offset: Number(offset),
          rating: 'g', // Solo contenuti family-friendly
          lang: 'it', // Priorità contenuti italiani
        },
        timeout: 10000,
      }
    );

    console.log('✅ Giphy search completed, found', response.data.data.length, 'stickers');

    res.json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Giphy search error:', error.response?.data || error.message);
      res.status(500).json({ 
        error: 'Failed to search Giphy stickers',
        details: error.response?.data || error.message
      });
    } else {
      console.error('❌ Giphy search error:', error);
      res.status(500).json({ 
        error: 'Failed to search Giphy stickers',
        details: String(error)
      });
    }
  }
});

// ✨ Endpoint per sticker trending
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const apiKey = process.env.GIPHY_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Giphy API key not configured' });
    }

    console.log('🔥 Getting trending Giphy stickers');

    const response = await axios.get<GiphySearchResponse>(
      'https://api.giphy.com/v1/stickers/trending',
      {
        params: {
          api_key: apiKey,
          limit: Math.min(Number(limit), 50),
          offset: Number(offset),
          rating: 'g',
        },
        timeout: 10000,
      }
    );

    console.log('✅ Trending stickers loaded:', response.data.data.length);

    res.json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Giphy trending error:', error.response?.data || error.message);
      res.status(500).json({ 
        error: 'Failed to get trending stickers',
        details: error.response?.data || error.message
      });
    } else {
      console.error('❌ Giphy trending error:', error);
      res.status(500).json({ 
        error: 'Failed to get trending stickers',
        details: String(error)
      });
    }
  }
});

// ✨ Endpoint per categorie predefinite
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = [
      { id: 'emotions', name: 'Emozioni', emoji: '😊' },
      { id: 'animals', name: 'Animali', emoji: '🐶' },
      { id: 'food', name: 'Cibo', emoji: '🍕' },
      { id: 'love', name: 'Amore', emoji: '❤️' },
      { id: 'party', name: 'Festa', emoji: '🎉' },
      { id: 'sports', name: 'Sport', emoji: '⚽' },
      { id: 'weather', name: 'Meteo', emoji: '☀️' },
      { id: 'travel', name: 'Viaggi', emoji: '✈️' },
    ];

    res.json({ categories });
  } catch (error) {
    console.error('❌ Categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// ✨ Endpoint per debug/test
router.get('/test', async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GIPHY_API_KEY;
    
    res.json({
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      testEndpoint: 'working'
    });
  } catch (error) {
    console.error('Test error:', error);
    const errorMessage = (error instanceof Error) ? error.message : String(error);
    res.status(500).json({ error: errorMessage });
  }
});

export default router;