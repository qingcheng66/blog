"use client"

import { site } from "@/data/site"

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative mt-auto">
      {/* Inject Serenity footer styles */}
      <style>{`
        .serenity-footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: min(80%, 800px);
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            var(--color-border) 20%,
            var(--color-accent) 50%,
            var(--color-border) 80%,
            transparent 100%
          );
        }
      `}</style>

      <div className="serenity-footer relative mx-auto max-w-4xl px-4 py-8"
        style={{ paddingBottom: `calc(2rem + env(safe-area-inset-bottom, 0px))` }}>
        {/* Top gradient border line */}
        <div className="flex flex-col items-center gap-4 pt-6">
          {/* Copyright */}
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs" style={{ color: "var(--color-text-muted)" }}>
            <span>©</span>
            <span>{year}</span>
            <a href="#" style={{ color: "var(--color-accent)" }}>{site.name}</a>
            <span>版权所有</span>
          </div>

{/* Tech stack note */}
          <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)", opacity: 0.6 }}>
            Powered by Next.js · Serenity Theme Lab
          </p>
        </div>
      </div>
    </footer>
  )
}
