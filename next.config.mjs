/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['graphql'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.S3_ENDPOINT ? process.env.S3_ENDPOINT.replace(/^https?:\/\//, '').replace(/:\d+$/, '') : 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;