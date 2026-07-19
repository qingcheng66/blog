"use client"

export default function Error({
  _error,
  reset,
}: {
  _error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[60dvh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-7xl font-bold text-muted-foreground/30">500</h1>
        <p className="text-lg">出了点问题</p>
        <p className="text-sm text-muted-foreground">
          页面加载时发生错误，请稍后重试。
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline cursor-pointer"
        >
          重新加载
        </button>
      </div>
    </div>
  )
}
