import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // Use environment variable for base URL, fallback to production URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://masky.space';
  
  // Define standard static routes
  const routes = [
    '',
    '/shop',
    '/sale',
    '/search',
    '/about',
    '/contact',
    '/track-order',
    '/returns',
    '/privacy-policy',
    '/terms-conditions',
  ];

  const staticPages = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: (route === '' || route === '/shop' || route === '/sale' ? 'daily' : 'weekly') as "daily" | "weekly",
    priority: route === '' ? 1 : route === '/shop' || route === '/sale' ? 0.9 : 0.7,
  }));

  // TODO: Fetch products from database
  // const products = await prisma.product.findMany({ select: { slug: true, updatedAt: true } })
  const mockProducts = [
    '/products/premium-linen-dress',
    '/products/silk-evening-gown',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // TODO: Fetch collections/categories from database
  // const categories = await prisma.category.findMany({ select: { slug: true, updatedAt: true } })
  const mockCollections = [
    '/categories/women',
    '/collections/summer-collection',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...mockProducts, ...mockCollections];
}
