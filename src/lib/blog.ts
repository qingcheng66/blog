import fs from "fs"
import path from "path"

export interface BlogPost {
  slug: string
  title: string
  date: string
  description: string
  tags?: string[]
}

const contentDir = path.join(process.cwd(), "src", "contents", "blog")

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(contentDir)) return []

  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"))

  return files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "")
      const raw = fs.readFileSync(path.join(contentDir, file), "utf-8")
      const meta = parseFrontmatter(raw)
      return { slug, ...meta } as BlogPost
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPost(slug: string): { content: string; meta: BlogPost } | null {
  const filePath = path.join(contentDir, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, "utf-8")
  const meta = parseFrontmatter(raw)
  const content = stripFrontmatter(raw)

  return { content, meta: { slug, ...meta } as BlogPost }
}

function parseFrontmatter(raw: string): Record<string, unknown> {
  const match = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}

  const meta: Record<string, unknown> = {}
  match[1].split("\n").forEach((line) => {
    const [key, ...rest] = line.split(":")
    if (key && rest.length) {
      let val = rest.join(":").trim()
      if (val.startsWith("[") && val.endsWith("]")) {
        val = val.slice(1, -1)
        meta[key.trim()] = val.split(",").map((t) => t.trim().replace(/['"]/g, ""))
      } else {
        meta[key.trim()] = val.replace(/['"]/g, "")
      }
    }
  })
  return meta
}

function stripFrontmatter(raw: string): string {
  return raw.replace(/^---[\s\S]*?\n---\n/, "")
}
