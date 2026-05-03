import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/book/"],
      disallow: ["/dashboard/", "/api/"],
    },
    sitemap: `${process.env.NEXTAUTH_URL}/sitemap.xml`,
  }
}
