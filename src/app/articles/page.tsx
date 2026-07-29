import type { Metadata } from "next"
import { getArticles } from "@/lib/content"
import { ArticleFeed } from "@/components/article-feed"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "文章",
  description: "技术文章与笔记",
}

export default async function ArticlesPage() {
  const articles = await getArticles()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <ArticleFeed articles={articles} />
    </div>
  )
}
