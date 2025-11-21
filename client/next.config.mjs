/** @type {import('next').NextConfig} */
const nextConfig = {
    // Force restart
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
