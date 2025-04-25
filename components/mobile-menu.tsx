"use client"

import { useState } from "react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { MapPin, BookOpen, Info, Phone, Menu, X, ExternalLink, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MobileMenu() {
  const { t } = useLanguage()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: Home,
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
    {
      href: "/about",
      label: t("nav.about"),
      icon: Info,
    },
  ]

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10 relative">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Menu</h2>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="rounded-full">
                <X className="h-5 w-5" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            <nav className="flex-1 overflow-auto py-4">
              <div className="flex flex-col space-y-1 px-2">
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
                        className="flex items-center gap-3 rounded-md px-3 py-2.5 text-base hover:bg-accent"
                        onClick={() => setOpen(false)}
                      >
                        <ItemIcon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                        <ExternalLink className="ml-auto h-4 w-4 opacity-70" />
                      </a>
                    )
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2.5 text-base hover:bg-accent",
                        isActive ? "bg-accent/50 font-medium text-amber-500" : "",
                      )}
                      onClick={() => setOpen(false)}
                    >
                      <ItemIcon className={cn("h-5 w-5", isActive ? "text-amber-500" : "")} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
