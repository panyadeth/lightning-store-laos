"use client"

import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { MapPin, BookOpen, Info, Phone, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export function MobileNavigation() {
  const { t } = useLanguage()
  const pathname = usePathname()

  const navItems = [
    {
      href: "/",
      label: t("nav.home"),
      icon: Home,
    },
    {
      href: "/about",
      label: t("nav.about"),
      icon: Info,
    },
    {
      href: "/maps",
      label: t("nav.maps"),
      icon: MapPin,
    },
    {
      href: "/blog",
      label: t("nav.blog"),
      icon: BookOpen,
    },
    {
      href: "https://bitcoiner.bio/lnstorelaos",
      label: t("nav.contact"),
      icon: Phone,
      external: true,
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t md:hidden">
      <div className="grid h-full grid-cols-5">
        {navItems.map((item) => {
          const isActive = item.external ? false : pathname === item.href
          const ItemIcon = item.icon

          if (item.external) {
            return (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center"
              >
                <ItemIcon className={cn("w-5 h-5 mb-1", isActive ? "text-amber-500" : "text-muted-foreground")} />
                <span className="text-xs">{item.label}</span>
              </a>
            )
          }

          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center">
              <ItemIcon className={cn("w-5 h-5 mb-1", isActive ? "text-amber-500" : "text-muted-foreground")} />
              <span className={cn("text-xs", isActive ? "text-amber-500" : "text-muted-foreground")}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
