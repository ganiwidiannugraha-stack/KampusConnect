/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['graphql'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      ...(process.env.S3_ENDPOINT ? [{
        protocol: 'https',
        hostname: process.env.S3_ENDPOINT.replace(/^https?:\/\//, '').replace(/:\d+$/, ''),
        port: '',
        pathname: '/**',
      }] : []),
    ],
  },
};

export default nextConfig;