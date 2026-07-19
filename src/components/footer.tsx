import { site } from "@/data/site"
import { TerminalSignature } from "./terminal-signature"

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-4xl px-4 py-8 flex flex-col items-center gap-6">
        <TerminalSignature />
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
