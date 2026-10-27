export type LocalProduct = {
  id: number;
  title: string;
  description: string;
  price: number;
  created_at: number;
};

export type NewLocalProduct = Pick<LocalProduct, 'title' | 'description' | 'price'>;
