import { useState, useRef, useEffect, useCallback } from "react"
import { MessageCircle, X, Send, Sparkles, Loader2, Mic, Plus } from "lucide-react"
import type { Transaction, Budget } from "../types"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { chatWithAI, parseTransactionFromText, type ChatMessage, type SpendingSummary } from "../lib/groq"
import { cn } from "../lib/utils"
import { useLocale } from "../lib/LocaleContext"

interface AIChatProps {
  transactions: Transaction[]
  budgets: Budget[]
  monthlySalary: number
  onAddTransaction: (t: Omit<Transaction, "id">) => void
}

type Mode = "ask" | "quicklog"

export default function AIChat({ transactions, budgets, monthlySalary, onAddTransaction }: AIChatProps) {
  const { t, locale } = useLocale()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>("ask")
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: t("aiChat.greeting") },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (open && mode === "quicklog") {
      setMessages([{ role: "assistant", content: t("aiChat.quickLogGreeting") }])
    }
  }, [mode, open])

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()
    recognition.lang = locale === "ar" ? "ar-SA" : "en-US"
    recognition.interimResults = false
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript
      setInput(text)
      setListening(false)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognition.start()
    setListening(true)
    recognitionRef.current = recognition
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  const buildContext = (): SpendingSummary => {
    const expenses = transactions.filter((t) => t.type === "expense")
    const incomes = transactions.filter((t) => t.type === "income")
    const totalIncome = incomes.reduce((s, t) => s + t.amount, 0)
    const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0)

    const catMap = new Map<string, number>()
    expenses.forEach((t) => catMap.set(t.category, (catMap.get(t.category) ?? 0) + t.amount))
    const total = totalExpenses || 1
    const topCategories = Array.from(catMap.entries())
      .map(([category, amount]) => ({ category, amount, pct: (amount / total) * 100 }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      monthlySalary,
      topCategories,
      budgets: budgets.map((b) => {
        const spent = transactions
          .filter((t) => t.type === "expense" && t.category === b.category)
          .reduce((s, t) => s + t.amount, 0)
        return { category: b.category, limit: b.limit, spent, pct: b.limit > 0 ? (spent / b.limit) * 100 : 0 }
      }),
      transactionCount: transactions.length,
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const text = input.trim()
    setInput("")

    if (mode === "quicklog") {
      setMessages((prev) => [...prev, { role: "user", content: text }])
      setLoading(true)
      try {
        const parsed = await parseTransactionFromText(text)
        const today = new Date().toISOString().split("T")[0]
        onAddTransaction({
          date: today,
          description: parsed.description,
          amount: Math.abs(parsed.amount),
          category: parsed.category,
          type: parsed.amount >= 0 ? "income" : "expense",
        })
        const sign = parsed.amount >= 0 ? "+" : "-"
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: t("aiChat.loggedMessage", { desc: parsed.description, sign, amount: Math.abs(parsed.amount).toFixed(2), category: parsed.category }),
        }])
      } catch {
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: t("aiChat.parseError"),
        }])
      } finally {
        setLoading(false)
      }
      return
    }

    const userMsg: ChatMessage = { role: "user", content: text }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const history = [...messages, userMsg]
      const context = buildContext()
      const reply = await chatWithAI(history, context)
      setMessages((prev) => [...prev, { role: "assistant", content: reply }])
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: t("aiChat.apiError") }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 h-[500px] max-h-[70vh] flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              <span className="font-semibold text-gray-900 dark:text-gray-100">{t("aiChat.title")}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-1 px-4 pt-2 pb-1">
            <button
              onClick={() => setMode("ask")}
              className={cn(
                "flex-1 text-sm font-medium py-1.5 rounded-lg transition-colors",
                mode === "ask"
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
              )}
            >
              <Sparkles className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />{t("aiChat.askAi")}
            </button>
            <button
              onClick={() => setMode("quicklog")}
              className={cn(
                "flex-1 text-sm font-medium py-1.5 rounded-lg transition-colors",
                mode === "quicklog"
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
              )}
            >
              <Plus className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />{t("aiChat.quickLog")}
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-emerald-600 text-white rounded-br-md"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white rounded-bl-md"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === "quicklog" ? t("aiChat.parsingTransaction") : t("aiChat.thinking")}
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-200 dark:border-gray-700 shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend() }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={mode === "quicklog" ? t("aiChat.quicklogPlaceholder") : t("aiChat.askPlaceholder")}
                  className="flex-1 pr-10"
                />
                <button
                  type="button"
                  onClick={listening ? stopListening : startListening}
                  className={cn(
                    "absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full flex items-center justify-center transition-colors",
                    listening
                      ? "bg-coral text-white animate-pulse"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                  )}
                  title={listening ? t("aiChat.stopRecording") : t("aiChat.voiceInput")}
                >
                  <Mic className="h-4 w-4" />
                </button>
              </div>
              <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 h-14 w-14 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  )
}
