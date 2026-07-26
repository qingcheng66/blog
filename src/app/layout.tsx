import type { Viewport } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { SearchModal } from "@/components/search-modal"
import { ScrollToTop } from "@/components/scroll-to-top"
import { GlassHeader } from "@/components/glass-header"
import { Footer } from "@/components/footer"
import { MusicPlayer } from "@/components/music-player"
// import { WeatherSceneLoader } from "@/components/weather-scene-loader"
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
        <ThemeProvider>
          <SearchModal />
{/* <WeatherSceneLoader /> */}
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
