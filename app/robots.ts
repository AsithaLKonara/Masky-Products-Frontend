import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://masky.space';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/products', '/collections', '/shop', '/journal', '/about', '/contact', '/faq'],
      disallow: [
        '/admin', 
        '/admin/*',
        '/pos',
        '/pos/*',
        '/account',
        '/account/*',
        '/checkout',
        '/cart',
        '/api/*',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
