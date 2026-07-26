import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { FileText, Briefcase, MessageCircle, Image, PenTool } from "lucide-react"
import { getArticles, getProjects, getThoughts, getGallery } from "@/lib/content"

export default async function AdminDashboardPage() {
  // Auth check (belt-and-suspenders with middleware)
  const jar = await cookies()
  const token = jar.get("admin_token")?.value
  const password = process.env.ADMIN_PASSWORD
  if (!password || !token || token !== password) {
    redirect("/admin/login")
  }

  const [articles, projects, thoughts, gallery] = await Promise.all([
    getArticles(),
    getProjects(),
    getThoughts(),
    getGallery(),
  ])

  const stats = [
    {
      label: "文章",
      count: articles.length,
      icon: FileText,
      href: "/admin/articles",
      accent: "var(--color-accent)",
    },
    {
      label: "项目",
      count: projects.length,
      icon: Briefcase,
      href: "/admin/projects",
      accent: "#50FA7B",
    },
    {
      label: "碎碎念",
      count: thoughts.length,
      icon: MessageCircle,
      href: "/admin/thoughts",
      accent: "#8BE9FD",
    },
    {
      label: "相册",
      count: gallery.length,
      icon: Image,
      href: "/admin/gallery",
      accent: "#FFB86C",
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
          仪表盘
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
          博客内容概览
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, count, icon: Icon, href, accent }) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl p-5 transition-all duration-200 hover:translate-y-[-2px]"
            style={{
              background: "var(--glass-bg-strong)",
              backdropFilter: "blur(var(--glass-blur))",
              WebkitBackdropFilter: "blur(var(--glass-blur))",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: `${accent}18`,
                  color: accent,
                }}
              >
                <Icon size={20} />
              </div>
              <span className="text-3xl font-bold tabular-nums" style={{ color: "var(--color-text)" }}>
                {count}
              </span>
            </div>
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {label}
            </span>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div
        className="rounded-xl p-5"
        style={{
          background: "var(--glass-bg-strong)",
          backdropFilter: "blur(var(--glass-blur))",
          WebkitBackdropFilter: "blur(var(--glass-blur))",
          border: "1px solid var(--color-border)",
        }}
      >
        <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--color-text)" }}>
          快捷操作
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction
            href="/admin/articles/new"
            icon={PenTool}
            label="写文章"
            accent="var(--color-accent)"
          />
          <QuickAction
            href="/admin/projects"
            icon={Briefcase}
            label="加项目"
            accent="#50FA7B"
          />
          <QuickAction
            href="/admin/gallery"
            icon={Image}
            label="传照片"
            accent="#FFB86C"
          />
          <QuickAction
            href="/admin/about"
            icon={PenTool}
            label="改关于"
            accent="#8BE9FD"
          />
        </div>
      </div>
    </div>
  )
}

function QuickAction({
  href,
  icon: Icon,
  label,
  accent,
}: {
  href: string
  icon: React.ComponentType<{ size: number }>
  label: string
  accent: string
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 p-4 rounded-lg transition-all duration-200 hover:translate-y-[-1px]"
      style={{
        background: "var(--color-bg-mute)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ background: `${accent}18`, color: accent }}
      >
        <Icon size={18} />
      </div>
      <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
        {label}
      </span>
    </Link>
  )
}
