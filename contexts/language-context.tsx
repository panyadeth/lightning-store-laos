"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { en, la } from "@/translations"

type LanguageCode = "EN" | "LA"

type LanguageContextType = {
  language: LanguageCode
  setLanguage: (language: LanguageCode) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>("EN")

  // Load saved language preference from localStorage on client side
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as LanguageCode
    if (savedLanguage && ["EN", "LA"].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("language", language)
    // Update html lang attribute for accessibility
    document.documentElement.lang = language.toLowerCase()
  }, [language])

  // Translation function
  const t = (key: string): string => {
    const translations = {
      EN: en,
      LA: la,
    }

    // Split the key by dots to access nested properties
    const keys = key.split(".")
    let translation = translations[language]

    // Navigate through the nested objects
    for (const k of keys) {
      if (translation && translation[k]) {
        translation = translation[k]
      } else {
        // Fallback to English if translation is missing
        let fallback = en
        for (const k of keys) {
          if (fallback && fallback[k]) {
            fallback = fallback[k]
          } else {
            return key // Return the key itself if no translation found
          }
        }
        return fallback
      }
    }

    return translation
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
