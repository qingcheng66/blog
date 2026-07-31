import type { Viewport } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { AdminGate } from "@/components/admin-gate"
import { SearchModal } from "@/components/search-modal"
import { ScrollToTop } from "@/components/scroll-to-top"
import { GlassHeader } from "@/components/glass-header"
import { Footer } from "@/components/footer"
import { MusicPlayer } from "@/components/music-player"
import { BackgroundLayer } from "@/components/background-layer"
import { getMusicList, getSettings } from "@/lib/content"
import { site } from "@/data/site"
import "./globals.css"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#E87830",
}

export const metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [music, settings] = await Promise.all([getMusicList(), getSettings()])
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* Inject theme class before first paint to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                  // Light / no stored preference → no class needed (CSS :root defaults to warm paper)
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <BackgroundLayer background={settings.background} />
        <div className="paper-grain" aria-hidden />
        <ThemeProvider>
          <AdminGate><SearchModal /></AdminGate>
          <AdminGate><ScrollToTop /></AdminGate>
          <AdminGate><GlassHeader /></AdminGate>
          <main className="flex-1">{children}</main>
          <AdminGate><Footer /></AdminGate>
          <AdminGate><MusicPlayer music={music} /></AdminGate>
        </ThemeProvider>
      </body>
    </html>
  )
}
