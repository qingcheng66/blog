export interface ShortLink {
  slug: string
  url: string
  title?: string
}

const links: ShortLink[] = [
  { slug: "gh", url: "https://github.com/qingcheng66", title: "GitHub" },
  { slug: "blog", url: "https://blog.084623224.xyz/blog", title: "博客" },
]

export function getLink(slug: string): ShortLink | undefined {
  return links.find((l) => l.slug === slug)
}

export function getAllLinks(): ShortLink[] {
  return links
}
