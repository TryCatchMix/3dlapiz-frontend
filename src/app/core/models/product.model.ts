export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  category_id: number;
  created_at: string | null;
  updated_at: string | null;
  category: Category;
  images: ProductImage[];
}
