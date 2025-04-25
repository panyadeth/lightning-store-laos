import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { LanguageProvider } from "@/contexts/language-context"
import { MobileTabs } from "@/components/mobile-tabs"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "CryptoQR - Pay Any QR Code with Cryptocurrency",
  description: "Use your cryptocurrency to pay at local merchants with QR codes. Fast, secure, and convenient.",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <LanguageProvider>
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <MobileTabs />
              <div className="flex-1">{children}</div>
              <SiteFooter />
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
