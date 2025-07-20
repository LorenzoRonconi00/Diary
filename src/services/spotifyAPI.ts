import axios from 'axios';

const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';

export interface SpotifyTrack {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: {
        name: string;
        images: Array<{ url: string; height: number; width: number }>;
    };
    preview_url?: string;
}

export interface SpotifySearchResponse {
    tracks: {
        items: SpotifyTrack[];
    }
}

class SpotifyAPI {
    private accessToken: string | null = null;
    private tokenExpiry: number | null = null;

    private async getAccessToken(): Promise<string> {
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            if (!this.accessToken) throw new Error('Access token is not set');
            return this.accessToken;
        }

        try {
            const response = await axios.post('/api/spotify/token');
            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
            if (!this.accessToken) {
                throw new Error('Failed to retrieve access token');
            }
            return this.accessToken;
        } catch (error) {
            console.error('Error fetching Spotify access token:', error);
            throw new Error('Unable to fetch Spotify access token');
        }
    }

    async searchTracks(query: string): Promise<SpotifyTrack[]> {
        try {
            const token = await this.getAccessToken();

            const response = await axios.get<SpotifySearchResponse>(
                `${SPOTIFY_BASE_URL}/search`,
                {
                    params: {
                        q: query,
                        type: 'track',
                        limit: 20
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            )

            return response.data.tracks.items;

        } catch (error) {
            console.error('Error searching tracks:', error);
            throw new Error('Unable to search tracks');
        }
    }
}

export const spotifyAPI = new SpotifyAPI();