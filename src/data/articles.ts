export interface Article {
  title: string
  description: string
  date: string
  slug: string
  cover?: string
  views: number
  pinned?: boolean
}

export const articles: Article[] = [
  // 在此添加文章数据。每篇文章对应 src/contents/blog/ 目录下的一篇 MDX 文件。
  // 格式见上方 Article 接口定义。
]

export interface StreamItem {
  verb: string
  target: string
  href: string
  date: string
}

export const streamItems: StreamItem[] = [
  // 在此添加碎碎念/站点动态。格式见上方 StreamItem 接口定义。
]
