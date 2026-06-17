export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  created_at: string | null;
  updated_at: string | null;
}

export type ProductVariant = 'painted' | 'unpainted';

export interface Product {
  id: string;
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
