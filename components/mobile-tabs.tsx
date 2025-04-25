"use client"

import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export function MobileTabs() {
  const { t } = useLanguage()
  const pathname = usePathname()

  const tabItems = [
    {
      href: "/about",
      label: t("nav.about"),
    },
    {
      href: "/maps",
      label: t("nav.maps"),
    },
    {
      href: "/blog",
      label: t("nav.blog"),
    },
    {
      href: "https://bitcoiner.bio/lnstorelaos",
      label: t("nav.contact"),
      external: true,
    },
  ]

  return (
    <div className="md:hidden w-full overflow-x-auto scrollbar-hide border-b">
      <div className="flex whitespace-nowrap px-4 py-2">
        {tabItems.map((item) => {
          const isActive = item.external ? false : pathname === item.href

          if (item.external) {
            return (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn("px-4 py-2 text-sm font-medium transition-colors", "hover:text-amber-500")}
              >
                {item.label}
              </a>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                isActive ? "text-amber-500 border-b-2 border-amber-500" : "hover:text-amber-500",
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
