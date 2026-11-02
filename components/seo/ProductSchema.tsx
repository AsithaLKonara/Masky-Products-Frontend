export type ProductSchemaProps = {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  url: string;
  sku?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  brand?: string;
};

export default function ProductSchema(props: ProductSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: props.name,
    description: props.description,
    image: props.image,
    sku: props.sku,
    brand: {
      '@type': 'Brand',
      name: props.brand || 'MASKY PRODUCT',
    },
    offers: {
      '@type': 'Offer',
      url: props.url,
      priceCurrency: props.currency || 'LKR',
      price: props.price,
      availability: `https://schema.org/${props.availability || 'InStock'}`,
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
