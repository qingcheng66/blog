import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  MessageCircle,
  Image,
  User,
  Music,
  Settings as SettingsIcon,
  ArrowLeft,
} from "lucide-react"
import { LogoutButton } from "@/components/admin-logout-button"

const SIDEBAR_LINKS = [
  { href: "/admin", label: "仪表盘", icon: LayoutDashboard },
  { href: "/admin/articles", label: "文章", icon: FileText },
  { href: "/admin/projects", label: "项目", icon: Briefcase },
  { href: "/admin/thoughts", label: "碎碎念", icon: MessageCircle },
  { href: "/admin/gallery", label: "相册", icon: Image },
  { href: "/admin/music", label: "音乐", icon: Music },
  { href: "/admin/settings", label: "设置", icon: SettingsIcon },
  { href: "/admin/about", label: "关于", icon: User },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side auth check
  const jar = await cookies()
  const token = jar.get("admin_token")?.value
  const password = process.env.ADMIN_PASSWORD

  if (!password || !token || token !== password) {
    redirect("/admin/login")
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 bottom-0 w-56 flex flex-col z-40"
        style={{
          background: "var(--glass-bg-strong)",
          backdropFilter: "blur(var(--glass-blur))",
          WebkitBackdropFilter: "blur(var(--glass-blur))",
          borderRight: "1px solid var(--color-border)",
        }}
      >
        {/* Logo */}
        <div className="px-5 py-5">
          <Link
            href="/admin"
            className="text-base font-bold tracking-tight"
            style={{ color: "var(--color-accent)" }}
          >
            Admin · Lab
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 flex flex-col gap-0.5">
          {SIDEBAR_LINKS.map(({ href, label, icon: Icon }) => {
            // Active detection handled client-side
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-white/5"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <Icon size={17} />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer links */}
        <div className="px-3 pb-5 flex flex-col gap-0.5">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-white/5"
            style={{ color: "var(--color-text-muted)" }}
          >
            <ArrowLeft size={17} />
            <span>返回博客</span>
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 flex-1 p-6 min-h-screen" style={{ paddingTop: "24px" }}>
        {children}
      </main>

      {/* Sidebar active state via CSS + style tag */}
      <style>{`
        aside a[href] { color: var(--color-text-secondary); }
      `}</style>
    </div>
  )
}
