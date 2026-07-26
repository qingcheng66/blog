import Link from "next/link"
import { getArticles } from "@/lib/content"
import { Plus, Edit, Eye } from "lucide-react"
import { DeleteConfirmButton } from "@/components/admin-delete-button"

export default async function AdminArticlesPage() {
  const articles = await getArticles()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
            文章管理
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            共 {articles.length} 篇
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90"
          style={{ background: "var(--color-accent)", color: "#fff" }}
        >
          <Plus size={16} />
          新建文章
        </Link>
      </div>

      {articles.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{
            background: "var(--glass-bg-strong)",
            border: "1px solid var(--color-border)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            还没有文章，点击上方按钮创建第一篇
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {articles.map((article) => (
            <div
              key={article.slug}
              className="flex items-center gap-4 rounded-xl px-5 py-4 transition-all duration-200 hover:border-white/15"
              style={{
                background: "var(--glass-bg-strong)",
                backdropFilter: "blur(var(--glass-blur))",
                WebkitBackdropFilter: "blur(var(--glass-blur))",
                border: "1px solid var(--color-border)",
              }}
            >
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3
                    className="text-sm font-medium truncate"
                    style={{ color: "var(--color-text)" }}
                  >
                    {article.title}
                  </h3>
                  {article.pinned && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                      style={{
                        color: "var(--color-accent)",
                        background: "rgba(var(--color-accent-rgb), 0.12)",
                      }}
                    >
                      置顶
                    </span>
                  )}
                </div>
                <p
                  className="text-xs mt-1 truncate max-w-xl"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {article.description}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {article.date}
                  </span>
                  <span className="text-xs inline-flex items-center gap-1" style={{ color: "var(--color-text-muted)" }}>
                    <Eye size={11} />{article.views}
                  </span>
                  {article.tags.length > 0 && (
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {article.tags.slice(0, 3).join(" · ")}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link
                  href={`/admin/articles/${article.slug}`}
                  className="p-2 rounded-lg transition-colors hover:bg-white/5"
                  style={{ color: "var(--color-text-muted)" }}
                  title="编辑"
                >
                  <Edit size={15} />
                </Link>
                <DeleteConfirmButton
                  slug={article.slug}
                  title={article.title}
                  apiPath={`/api/admin/articles/${article.slug}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
