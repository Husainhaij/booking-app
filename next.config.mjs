

const nextConfig = {
  // Allow Prisma to work properly in serverless environments (Next.js 14)
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },

  images: {
    remotePatterns: [],
  },

  // Strict mode catches potential bugs early
  reactStrictMode: true,
}

export default nextConfig
