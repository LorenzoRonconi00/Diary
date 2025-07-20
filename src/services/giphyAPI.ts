export interface GiphySticker {
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

export interface GiphyCategory {
  id: string;
  name: string;
  emoji: string;
}

export interface GiphySearchResponse {
  data: GiphySticker[];
  pagination: {
    total_count: number;
    count: number;
    offset: number;
  };
}