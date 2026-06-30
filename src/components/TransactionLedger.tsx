import { useState, useMemo } from "react"
import { Plus, Search, Trash2, Edit3 } from "lucide-react"
import type { Budget, Transaction } from "../types"
import { CATEGORIES } from "../types"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Label } from "./ui/label"
import { formatCurrency } from "../lib/utils"
import { formatHijri } from "../lib/calendar"
import { useLocale } from "../lib/LocaleContext"

interface TransactionLedgerProps {
  transactions: Transaction[]
  budgets?: Budget[]
  alternativeCalendar: boolean
  onAdd: (t: Omit<Transaction, "id">) => void
  onUpdate: (id: string, t: Omit<Transaction, "id">) => void
  onDelete: (id: string) => void
}

export default function TransactionLedger({ transactions, budgets, alternativeCalendar, onAdd, onUpdate, onDelete }: TransactionLedgerProps) {
  const { t } = useLocale()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ date: "", description: "", category: "", amount: "", type: "expense" as "income" | "expense" })

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false
      if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [transactions, search, typeFilter, categoryFilter])

  const resetForm = () => {
    setForm({ date: "", description: "", category: "", amount: "", type: "expense" })
    setEditingId(null)
  }

  const openEdit = (t: Transaction) => {
    setForm({ date: t.date, description: t.description, category: t.category, amount: String(t.amount), type: t.type })
    setEditingId(t.id)
    setDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!form.date || !form.description || !form.category || !form.amount) return
    const data = { date: form.date, description: form.description, category: form.category, amount: Number.parseFloat(form.amount), type: form.type }
    if (editingId) {
      onUpdate(editingId, data)
    } else {
      onAdd(data)
    }
    setDialogOpen(false)
    resetForm()
  }

  const categories: string[] = [...new Set([...CATEGORIES, ...(budgets?.map((b) => b.category) ?? []), "Salary", "Freelance", "Investment"])]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("transactions.title")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("transactions.subtitle")}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> {t("transactions.addTransaction")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? t("transactions.editTransaction") : t("transactions.newTransaction")}</DialogTitle>
              <DialogDescription>{t("transactions.fillDetails")}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">{t("transactions.date")}</Label>
                  <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">{t("transactions.type")}</Label>
                  <Select value={form.type} onValueChange={(v: "income" | "expense") => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">{t("transactions.income")}</SelectItem>
                      <SelectItem value="expense">{t("transactions.expense")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">{t("transactions.description")}</Label>
                <Input id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t("transactions.descriptionPlaceholder")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cat">{t("transactions.category")}</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue placeholder={t("transactions.select")} /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>{t("categories." + c)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amt">{t("transactions.amount")}</Label>
                  <Input id="amt" type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder={t("common.amountPlaceholder")} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm() }}>{t("transactions.cancel")}</Button>
              <Button onClick={handleSubmit}>{editingId ? t("transactions.update") : t("transactions.add")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t("transactions.searchPlaceholder")}
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("transactions.allTypes")}</SelectItem>
            <SelectItem value="income">{t("transactions.income")}</SelectItem>
            <SelectItem value="expense">{t("transactions.expense")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("transactions.allCategories")}</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{t("categories." + c)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("transactions.dateColumn")}</TableHead>
                <TableHead>{t("transactions.descriptionColumn")}</TableHead>
                <TableHead>{t("transactions.categoryColumn")}</TableHead>
                <TableHead className="text-right">{t("transactions.amountColumn")}</TableHead>
                <TableHead className="text-center w-20">{t("transactions.actionsColumn")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-400 py-12">
                    {t("transactions.noResults")}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((tr) => (
                  <TableRow key={tr.id}>
                    <TableCell className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {alternativeCalendar ? (
                        <span>{tr.date}<br /><span className="text-xs text-gray-400 dark:text-gray-500">{formatHijri(tr.date)}</span></span>
                      ) : tr.date}
                    </TableCell>
                    <TableCell className="font-medium">{tr.description}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{t("categories." + tr.category)}</Badge>
                    </TableCell>
                    <TableCell className={`text-right font-semibold whitespace-nowrap ${tr.type === "income" ? "text-emerald-600" : "text-coral"}`}>
                      {tr.type === "income" ? "+" : "-"}{formatCurrency(tr.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(tr)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(tr.id)}>
                          <Trash2 className="h-4 w-4 text-coral" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">{children}</div>
}
