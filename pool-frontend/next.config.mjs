/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',

    images: { unoptimized: true },
    headers: async () => [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' }
        ]
      }
    ]
  };
  
  export default nextConfig;