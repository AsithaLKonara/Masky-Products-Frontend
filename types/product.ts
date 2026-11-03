export interface ProductVariant {
  id: string;
  productId: string;
  name: string | null;
  sku: string | null;
  price: number;
  salePrice: number | null;
  stockStatus: string;
  quantity: number;
  color: string | null;
  size: string | null;
  featuredImage: string | null;
  gallery: string[];
  flashSaleItems?: {
    salePrice: number;
    flashSale: {
      name: string;
      discount: number;
      status: string;
      startDate: string | null;
      endDate: string | null;
    };
  }[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  excerpt: string | null;
  categoryId: string | null;
  category?: { id: string; name: string; slug: string; };
  status?: string;
  allowedPaymentMethods?: string[];
  sizeGuideEnabled?: boolean;
  sizeGuideContent?: string | null;
  sizeGuideImageUrl?: string | null;
  manufactureDate?: string | null;
  expiryDate?: string | null;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
}
