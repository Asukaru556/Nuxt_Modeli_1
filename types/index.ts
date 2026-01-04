export interface ICategory {
  id: number;
  name: string;
}

export interface IModel {
  id: number;
  category_id: number | null;
  title: string;
  description: string | null;
  image_path: string | null;
  model_path: string;        
  price: number | null;
  direct_purchase_url: string | null;
  button_name: string | null;
  is_active: boolean;        
  is_stock: boolean;         
  position: number;
  created_at?: string;
  updated_at?: string;
}