import ClientContent from "./ClientContent";

import { serverFetch } from "@/lib/server-fetch";
import { Product } from "@/types/product";
import { PaginatedResponse } from "@/types/api";

export const metadata = {
  title: "Sale - MASKY PRODUCT",
  description: "Sale page for MASKY PRODUCT."
};

// Server-render on demand — prevents Railway build hanging on API calls during SSG
export const dynamic = 'force-dynamic';

export default async function Page() {
  const productsRes = await serverFetch<PaginatedResponse<Product>>("/products?skip=0&take=12", {
    next: { tags: ["products"], revalidate: 300 }
  }).catch(() => undefined);

  return <ClientContent initialData={productsRes} />;
}
