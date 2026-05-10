/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { disableStaticImages: true },
  staticPageGenerationTimeout: 300,
  turbopack: {},
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|webp|avif|svg)$/i,
      type: "asset/resource",
    })

    return config
  },
}


export default nextConfig
