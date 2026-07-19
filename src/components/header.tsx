"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Moon, Sun, Menu } from "lucide-react"
import { useTheme } from "@/hooks/use-theme"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { site } from "@/data/site"
import { cn } from "@/lib/utils"
import { MagneticWrapper } from "@/components/magnetic-wrapper"

const nav = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/projects", label: "项目" },
  { href: "/about", label: "关于" },
]

export function Header() {
  const pathname = usePathname()
  const { setTheme, theme, resolvedTheme } = useTheme()

  return (
    <header
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold">
          {site.name}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <MagneticWrapper key={item.href} strength={0.2}>
              <Link
                href={item.href}
                className={cn(
                  "text-sm transition-colors hover:text-foreground",
                  pathname === item.href ? "text-foreground font-medium" : "text-muted-foreground",
                )}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            </MagneticWrapper>
          ))}
          <Button variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label="切换主题">
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </nav>

        <Sheet>
          <SheetTrigger className="md:hidden p-3 hover:bg-accent active:bg-accent/70 rounded-md cursor-pointer" aria-label="导航菜单">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="mt-8 flex flex-col gap-4">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-lg py-2",
                    pathname === item.href ? "font-medium" : "text-muted-foreground",
                  )}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
              <Button
                variant="ghost"
                className="justify-start px-0"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              >
                {resolvedTheme === "dark" ? "亮色模式" : "暗色模式"}
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
