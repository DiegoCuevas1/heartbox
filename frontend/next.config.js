/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    images: {
        remotePatterns: [
            {
              protocol: 'https',
              hostname: 'dev-heartbox.s3.us-east-2.amazonaws.com',
              port: '',
              pathname: '/**/**',
            },
          ],
    },
}

module.exports = nextConfig
