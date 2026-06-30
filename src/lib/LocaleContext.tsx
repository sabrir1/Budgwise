import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { t as translate, getDir, type Locale } from "./locales"

interface LocaleContextValue {
  locale: Locale
  dir: "ltr" | "rtl"
  t: (key: string, vars?: Record<string, string | number>) => string
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

const STORAGE_KEY = "budgetwise-locale"

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === "en" || stored === "ar") return stored
    } catch {}
    return "en"
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale)
  }, [locale])

  useEffect(() => {
    document.documentElement.dir = getDir(locale)
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
  }, [])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(key, locale, vars),
    [locale],
  )

  return (
    <LocaleContext.Provider value={{ locale, dir: getDir(locale), t, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider")
  return ctx
}
