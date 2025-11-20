/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ik.imagekit.io',
                pathname: '/fmt3jswfv/**',
            },
        ],
    },
    // Ensure proper output for Vercel
    output: 'standalone',
};

export default nextConfig;
