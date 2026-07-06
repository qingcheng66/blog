import { site } from "@/data/site"

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-4xl px-4 py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {site.name}. All rights reserved.</p>
      </div>
    </footer>
  )
}
