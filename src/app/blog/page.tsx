import { getAllPosts } from "@/lib/blog"
import { BlogClient } from "./blog-client"

export default function BlogPage() {
  const posts = getAllPosts()
  return <BlogClient posts={posts} />
}
