import { site } from "@/data/site"

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-4xl px-4 py-8 flex flex-col items-center gap-6">
        <p className="text-sm text-muted-foreground italic">
          不设限，不跟风 · 用代码让想法成真
        </p>
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
