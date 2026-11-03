import ShopContent from "./ShopContent";

import { serverFetch } from "@/lib/server-fetch";
import { Product } from "@/types/product";
import { PaginatedResponse } from "@/types/api";

export const metadata = {
  title: "Shop - MASKY PRODUCT",
  description: "Browse our artisan collection of dehydrated, fresh, ready-to-eat and frozen gourmet mushrooms.",
};

// Server-render on demand — prevents Railway build hanging on API calls during SSG
export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const productsRes = await serverFetch<PaginatedResponse<Product>>("/products?skip=0&take=12", {
    next: { tags: ["products"], revalidate: 300 }
  }).catch(() => undefined);

  return <ShopContent initialData={productsRes} />;
}
