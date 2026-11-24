import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://github-social-manager.acharyanischal.com.np";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/docs"],
        disallow: ["/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
