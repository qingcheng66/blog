import type { Viewport } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { StarField } from "@/components/star-field"
import { SearchModal } from "@/components/search-modal"
import { ScrollToTop } from "@/components/scroll-to-top"
import { GlassHeader } from "@/components/glass-header"
import { Footer } from "@/components/footer"
import { MusicPlayer } from "@/components/music-player"
import { WeatherSceneLoader } from "@/components/weather-scene-loader"
import { site } from "@/data/site"
import "./globals.css"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FF79C6",
}

export const metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
                  if (theme === 'light') {
                    document.documentElement.classList.add('light');
                  } else if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <ThemeProvider>
          {/* Background: ink-wash GIF + dark overlay, below StarField (z:-5) */}
          <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -10 }}>
            <div
              className="absolute inset-0"
              style={{
                background: "url('/bg.gif') center/cover no-repeat",
                backgroundSize: "cover",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "none",
              }}
            />
          </div>
          <SearchModal />
          <WeatherSceneLoader />
          <StarField />
          <ScrollToTop />
          <GlassHeader />
          <main className="flex-1">{children}</main>
          <Footer />
          <MusicPlayer />
        </ThemeProvider>
      </body>
    </html>
  )
}
