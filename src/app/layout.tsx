import type { Metadata } from "next"
import { Noto_Sans_SC } from "next/font/google"
import { ThemeGlow } from "@/components/theme-glow"
import { StarField } from "@/components/star-field"
import { ScrollToTop } from "@/components/scroll-to-top"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { site } from "@/data/site"
import "./globals.css"

const notoSans = Noto_Sans_SC({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
})

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
    <html lang="zh-CN" suppressHydrationWarning className={notoSans.variable}>
      <body className="min-h-screen flex flex-col bg-background font-sans antialiased">
        <ThemeProvider>
          <StarField />
          <ThemeGlow />
          <ScrollToTop />
          <Header />
          <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
