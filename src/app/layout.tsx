import type { Metadata, Viewport } from "next"
import { ThemeGlow } from "@/components/theme-glow"
import { StarField } from "@/components/star-field"
import { ScrollToTop } from "@/components/scroll-to-top"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { site } from "@/data/site"
import "./globals.css"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfcf9" },
    { media: "(prefers-color-scheme: dark)", color: "#2d2a24" },
  ],
}

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    url: site.url,
    siteName: site.name,
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: site.url },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className="overflow-x-hidden">
      <body className="min-h-screen flex flex-col bg-background font-sans antialiased overflow-x-hidden">
        <ThemeProvider>
          <StarField />
          <ThemeGlow />
          <ScrollToTop />
          <Header />
          <main className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-8 pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
