import { getAllPosts } from "@/lib/blog"
import { site } from "@/data/site"

export const dynamic = "force-static"

export async function GET() {
  const posts = getAllPosts()

  const items = posts
    .map(
      (p) => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${site.url}/blog/${p.slug}</link>
      <description><![CDATA[${p.description}]]></description>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      ${p.tags?.map((t) => `<category>${t}</category>`).join("\n      ") ?? ""}
      <guid>${site.url}/blog/${p.slug}</guid>
    </item>`,
    )
    .join("")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${site.name}</title>
    <link>${site.url}</link>
    <description>${site.description}</description>
    <language>zh-CN</language>
    <atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
