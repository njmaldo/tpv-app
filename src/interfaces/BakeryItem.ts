

export interface Category {
  id: string;
  name: string;
}

export interface BakeryItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  createdAt: string; 
  isActive?: boolean;
  categoryId: string;
  stock: number;
}