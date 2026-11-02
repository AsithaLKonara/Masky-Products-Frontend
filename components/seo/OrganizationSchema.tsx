export default function OrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://masky.space';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MASKY PRODUCT',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`, // Assuming a logo exists at the root
    sameAs: [
      'https://www.facebook.com/maskyproduct',
      'https://www.instagram.com/maskyproduct',
      // Add other social media URLs
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+94-11-234-5678', // Placeholder
      contactType: 'customer service',
      areaServed: 'LK',
      availableLanguage: ['en', 'si'],
    },
  };

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MASKY PRODUCT',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
    </>
  );
}
