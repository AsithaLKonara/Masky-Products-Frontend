import { Metadata } from 'next';
import CollectionPageClient from './CollectionPageClient';

type Props = {
  params: Promise<{ slug: string }>;
};

import { serverFetch } from "@/lib/server-fetch";
import { Product } from "@/types/product";
import { PaginatedResponse } from "@/types/api";

// Server-render on demand — prevents Railway build hanging on API calls during SSG
export const dynamic = 'force-dynamic';

// This function can eventually use prisma.collection.findUnique() based on the slug.
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
    description: `Explore our exclusive ${mockTitle} collection at MASKY PRODUCT. Hand-picked pieces edited for quiet luxury.`,
    alternates: {
      canonical: `/collections/${slug}`,
    },
    openGraph: {
      title: `${mockTitle} Collection | MASKY PRODUCT`,
      description: `Explore our exclusive ${mockTitle} collection at MASKY PRODUCT.`,
      url: `/collections/${slug}`,
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `${mockTitle} Collection`,
        }
      ],
    }
  };
}

export default async function CollectionPage({ params }: Props) {
  // Wait, does the client component accept params? Let's not pass params if we don't know it takes it.
  // The client component uses useParams() based on the head command output! 
  // "import { useParams } from 'next/navigation';"
  // Using a category filter simulating collection for now since there's no collections endpoint
  const productsRes = await serverFetch<PaginatedResponse<Product>>(`/products?skip=0&take=12`, {
    next: { tags: ["products"], revalidate: 300 }
  }).catch(() => undefined);

  return <CollectionPageClient initialData={productsRes} />;
}
