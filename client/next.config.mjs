/** @type {import('next').NextConfig} */
const nextConfig = {
    // Disable StrictMode in development to prevent Leaflet map initialization issues
    // StrictMode intentionally double-mounts components which conflicts with Leaflet
    reactStrictMode: false,
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
