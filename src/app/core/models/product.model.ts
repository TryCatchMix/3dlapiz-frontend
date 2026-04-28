export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  created_at: string | null;
  updated_at: string | null;
}

export type ProductVariant = 'painted' | 'unpainted';

export interface Product {
  id: number;
  name: string;
  description: string;
  youtube_url: string | null;
  price: string;
  unpainted_price: string | null;
  stock: number;
  created_at: string | null;
  updated_at: string | null;
  images: ProductImage[];
}
