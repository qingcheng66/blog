import { getArticleBySlug } from "@/lib/content"
import { notFound } from "next/navigation"
import ArticleEditor from "@/components/article-editor"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function EditArticlePage({ params }: Props) {
  const { slug } = await params
  const result = await getArticleBySlug(slug)

  if (!result) {
    notFound()
  }

  return <ArticleEditor initial={result} />
}
