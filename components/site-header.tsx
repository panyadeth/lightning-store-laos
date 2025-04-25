"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/language-selector"
import { useLanguage } from "@/contexts/language-context"
import { MapPin, BookOpen, Info, Phone, CreditCard, ExternalLink } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { MobileMenu } from "@/components/mobile-menu"

export function SiteHeader() {
  const { t } = useLanguage()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex items-center gap-2">
          <MobileMenu />
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-amber-500">
              <Image src="/logo.png" alt="LN STORE LAOS Logo" fill className="object-cover" priority />
            </div>
            <span className="font-bold text-lg hidden md:inline-block">LN STORE LAOS</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/maps">
                <MapPin className="mr-1 h-4 w-4" />
                {t("nav.maps")}
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/blog">
                <BookOpen className="mr-1 h-4 w-4" />
                {t("nav.blog")}
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <a href="https://bitcoiner.bio/lnstorelaos" target="_blank" rel="noopener noreferrer">
                <Phone className="mr-1 h-4 w-4" />
                {t("nav.contact")}
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/about">
                <Info className="mr-1 h-4 w-4" />
                {t("nav.about")}
              </Link>
            </Button>
          </nav>
          <div className="flex items-center space-x-2">
            <Button className="bg-amber-500 hover:bg-amber-600" asChild>
              <Link href="/pay">
                <CreditCard className="mr-1 h-4 w-4" />
                {t("nav.pay")}
              </Link>
            </Button>
            <LanguageSelector />
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
