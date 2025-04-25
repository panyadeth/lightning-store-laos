"use client"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-4 w-4" />
          <span className="ml-1">{language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage("EN")}>English</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("LA")}>Lao</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
