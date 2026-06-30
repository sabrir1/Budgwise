import { useEffect, useState } from "react"
import { Wallet, ArrowLeftRight, PieChart, Settings, Moon, Sun, Landmark, Globe, Smartphone } from "lucide-react"
import type { View, Transaction, Budget } from "../types"
import { cn } from "../lib/utils"
import { useLocale } from "../lib/LocaleContext"
import AIChat from "./AIChat"
import DownloadHub from "./DownloadHub"

interface LayoutProps {
  view: View
  onViewChange: (view: View) => void
  theme: "light" | "dark"
  onToggleTheme: () => void
  transactions: Transaction[]
  budgets: Budget[]
  monthlySalary: number
  onAddTransaction: (t: Omit<Transaction, "id">) => void
  children: React.ReactNode
}

const navItems: { id: View; icon: typeof Wallet }[] = [
  { id: "dashboard", icon: Wallet },
  { id: "transactions", icon: ArrowLeftRight },
  { id: "budgets", icon: PieChart },
  { id: "wealth", icon: Landmark },
  { id: "settings", icon: Settings },
]

export default function Layout({ view, onViewChange, theme, onToggleTheme, transactions, budgets, monthlySalary, onAddTransaction, children }: LayoutProps) {
  const { t, locale, setLocale, dir } = useLocale()
  const [downloadOpen, setDownloadOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  useEffect(() => {
    document.documentElement.dir = dir
    document.documentElement.lang = locale
  }, [dir, locale])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200" dir={dir}>
      <div className="flex flex-col lg:flex-row">
        <aside className="fixed bottom-0 left-0 right-0 z-40 lg:sticky lg:top-0 lg:h-screen lg:w-64 border-t lg:border-t-0 lg:border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="hidden lg:flex items-center gap-2 px-6 py-6 border-b border-gray-200 dark:border-gray-800">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{t("app.title")}</span>
          </div>

          <nav className="flex lg:flex-col gap-1 px-2 py-2 lg:px-4 lg:py-4">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 flex-1 lg:flex-none justify-center lg:justify-start",
                    view === item.id
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="hidden lg:inline">{t("nav." + item.id)}</span>
                </button>
              )
            })}

            <button
              onClick={() => setLocale(locale === "en" ? "ar" : "en")}
              className="hidden lg:flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <Globe className="h-5 w-5" />
              <span>{locale === "en" ? t("nav.arabic") : t("nav.english")}</span>
            </button>

            <button
              onClick={() => setDownloadOpen(true)}
              className="flex lg:hidden items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex-1 lg:flex-none justify-center"
              title={t("nav.downloadApp")}
            >
              <Smartphone className="h-5 w-5" />
            </button>

            <button
              onClick={() => setDownloadOpen(true)}
              className="hidden lg:flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
            >
              <Smartphone className="h-5 w-5" />
              <span>{t("nav.downloadApp")}</span>
            </button>

            <button
              onClick={onToggleTheme}
              className="hidden lg:flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all mt-auto"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span>{theme === "dark" ? t("nav.lightMode") : t("nav.darkMode")}</span>
            </button>
          </nav>
        </aside>

        <main className="flex-1 pb-20 lg:pb-0 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
      <AIChat transactions={transactions} budgets={budgets} monthlySalary={monthlySalary} onAddTransaction={onAddTransaction} />
      <DownloadHub open={downloadOpen} onOpenChange={setDownloadOpen} />
    </div>
  )
}
