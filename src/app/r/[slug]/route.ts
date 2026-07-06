import { redirect } from "next/navigation"
import { getLink } from "@/data/links"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const link = getLink(slug)
  if (!link) redirect("/")
  redirect(link.url)
}
