/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // All photography is saved locally (Pexels / Unsplash, see image-credits.md)
    remotePatterns: [
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 390, 480, 640, 768, 1024, 1280, 1440, 1920],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async redirects() {
    // Keep links/bookmarks from the supplied DJoz HTML archive working.
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/about.html', destination: '/about', permanent: true },
      { source: '/discography.html', destination: '/podcasts', permanent: true },
      { source: '/tours.html', destination: '/schedule', permanent: true },
      { source: '/videos.html', destination: '/studio', permanent: true },
      { source: '/blog.html', destination: '/news', permanent: true },
      { source: '/blog-details.html', destination: '/news', permanent: true },
      { source: '/contact.html', destination: '/contact', permanent: true },
      { source: '/live', destination: '/listen', permanent: true },
      { source: '/privacy', destination: '/legal/privacy-policy', permanent: true },
      { source: '/terms', destination: '/legal/terms', permanent: true },
      { source: '/cookies', destination: '/legal/cookie-policy', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default nextConfig;
