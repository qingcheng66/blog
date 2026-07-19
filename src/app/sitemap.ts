import { getAllPosts } from "@/lib/blog"
import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `https://yourdomain.com/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  return [
    {
      url: "https://yourdomain.com",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: "https://yourdomain.com/blog",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://yourdomain.com/projects",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...postEntries,
  ]
}
