/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Bật source maps để debug dễ dàng hơn
  productionBrowserSourceMaps: true,
};

export default nextConfig;
