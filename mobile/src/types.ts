export type Product = {
  id: number;
  title: string;
  description?: string;
  price: number;
  stock: number;
  rice_standard?: string;
  image_url?: string;
  owner_name?: string;
};

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  Prices: undefined;
  Product: { product: Product };
  Orders: undefined;
  Incoming: undefined;
  ManageProducts: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  AIGrading: undefined;
  Detect: undefined;
};
