export interface ShortLink {
  slug: string
  url: string
  title?: string
}

const links: ShortLink[] = [
  { slug: "gh", url: "https://github.com/你的用户名", title: "GitHub" },
  { slug: "blog", url: "https://yourdomain.com/blog", title: "博客" },
]

export function getLink(slug: string): ShortLink | undefined {
  return links.find((l) => l.slug === slug)
}

export function getAllLinks(): ShortLink[] {
  return links
}
