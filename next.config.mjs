/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
      },
      {
        protocol: 'http',
        hostname: 'host.docker.internal',
        port: '8080',
      },
    ],
  },
  async rewrites() {
    // Use host.docker.internal for Docker container to access host services
    const apiBaseUrl = process.env.NODE_ENV === 'production' 
      ? 'http://host.docker.internal:8080/api/v1'
      : 'http://localhost:8080/api/v1';
      
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiBaseUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;