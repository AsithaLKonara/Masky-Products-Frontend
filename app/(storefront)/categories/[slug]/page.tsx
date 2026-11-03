import { Metadata } from 'next';
import CategoryPageClient from './CategoryPageClient';

type Props = {
  params: Promise<{ slug: string }>;
};

import { serverFetch } from "@/lib/server-fetch";
import { Product } from "@/types/product";
import { PaginatedResponse } from "@/types/api";

// Server-render on demand — prevents Railway build hanging on API calls during SSG
export const dynamic = 'force-dynamic';

// This function can eventually use prisma.category.findUnique() based on the slug.
// For now, it returns mock metadata based on the slug.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // Format slug to look like a title for mock purposes
  const mockTitle = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
    
  return {
    title: mockTitle,
    description: `Shop our ${mockTitle} category at MASKY PRODUCT. Premium quality and sophisticated design for the modern wardrobe.`,
    alternates: {
      canonical: `/categories/${slug}`,
    },
    openGraph: {
      title: `${mockTitle} | MASKY PRODUCT`,
      description: `Shop our ${mockTitle} category at MASKY PRODUCT. Premium quality and sophisticated design.`,
      url: `/categories/${slug}`,
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `${mockTitle} Category`,
        }
      ],
    }
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const productsRes = await serverFetch<PaginatedResponse<Product>>(`/products?skip=0&take=12&category=${slug}`, {
    next: { tags: ["products"], revalidate: 300 }
  }).catch(() => undefined);

  return <CategoryPageClient initialData={productsRes} />;
}
