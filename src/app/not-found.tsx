import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-[60dvh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-7xl font-bold text-muted-foreground/30">404</h1>
        <p className="text-lg">页面未找到</p>
        <p className="text-sm text-muted-foreground">
          你访问的页面不存在，可能已被移除或链接有误。
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          返回首页
        </Link>
      </div>
    </div>
  )
}
