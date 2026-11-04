/** @type {import('next').NextConfig} */

let apiOrigin = 'http://127.0.0.1:5000';
try {
  apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000').origin;
} catch (e) {
  // fallback if URL is invalid
}

const securityHeaders = [
  // Prevent clickjacking
  { key: 'X-Frame-Options', value: 'DENY' },
  // Prevent MIME type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Control referrer information
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Restrict browser features
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  // Content Security Policy
  // Note: Turnstile requires challenges.cloudflare.com; Cloudinary for images
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src * data: blob: 'unsafe-inline'",
      "connect-src * data: blob: 'unsafe-inline'",
      "frame-src https://challenges.cloudflare.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://*.paykoko.com https://*.onepay.lk",
    ].join('; '),
  },
];

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const apiDest = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiDest}/:path*`,
      },
    ];
  },
  headers: async () => [
    {
      // Apply security headers to all routes
      source: '/(.*)',
      headers: securityHeaders,
    },
  ],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    localPatterns: [
      {
        pathname: '/**',
        search: '',
      },
    ],
  },
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

