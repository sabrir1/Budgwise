import { useState, useCallback } from "react"
import { Pencil, Plus, Trash2, Sparkles, Gift } from "lucide-react"
import type { Budget, Transaction } from "../types"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Progress } from "./ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Label } from "./ui/label"
import { formatCurrency } from "../lib/utils"
import { useLocale } from "../lib/LocaleContext"

interface BudgetManagementProps {
  budgets: Budget[]
  transactions: Transaction[]
  onUpdateBudget: (category: string, limit: number) => void
  onAddBudget: (category: string, limit: number) => void
  onRenameBudget: (oldCategory: string, newCategory: string) => void
  onDeleteBudget: (category: string) => void
}

function getProgressColor(pct: number): string {
  if (pct >= 100) return "#f43f5e"
  if (pct >= 75) return "#f59e0b"
  return "#10b981"
}

export default function BudgetManagement({ budgets, transactions, onUpdateBudget, onAddBudget, onRenameBudget, onDeleteBudget }: BudgetManagementProps) {
  const { t } = useLocale()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"edit" | "add">("edit")
  const [editCategory, setEditCategory] = useState("")
  const [editNewName, setEditNewName] = useState("")
  const [editLimit, setEditLimit] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [presetsOpen, setPresetsOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  const presets = [
    {
      id: "festive-gifting",
      nameKey: "budgets.preset.festive.name",
      descKey: "budgets.preset.festive.desc",
      icon: Gift,
      adjustments: [
        { category: "Food & Dining", type: "boost" as const, amount: 1200 },
        { category: "Family Hospitality", type: "create" as const, amount: 500 },
        { category: "Gifting & Charity", type: "create" as const, amount: 800 },
      ],
    },
  ]

  type EditableAdj = { enabled: boolean; category: string; amount: number; type: "create" | "boost" }
  const [customizations, setCustomizations] = useState<EditableAdj[]>([])

  const selectPreset = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId)
    if (!preset) return
    setSelectedPreset(presetId)
    setCustomizations(
      preset.adjustments.map((adj) => ({
        enabled: true,
        category: adj.category,
        amount: adj.amount,
        type: adj.type,
      })),
    )
  }

  const applyCustomizations = useCallback(() => {
    for (const adj of customizations) {
      if (!adj.enabled || !adj.category.trim()) continue
      if (adj.type === "create") {
        const exists = budgets.some((b) => b.category === adj.category.trim())
        if (!exists) {
          onAddBudget(adj.category.trim(), adj.amount)
        }
      } else {
        const existing = budgets.find((b) => b.category === adj.category.trim())
        if (existing) {
          onUpdateBudget(adj.category.trim(), Math.max(existing.limit, adj.amount))
        } else {
          onAddBudget(adj.category.trim(), adj.amount)
        }
      }
    }
    setPresetsOpen(false)
    setSelectedPreset(null)
  }, [customizations, budgets, onAddBudget, onUpdateBudget])

  const calculatedBudgets = budgets.map((b) => {
    const spent = transactions
      .filter((t) => t.type === "expense" && t.category === b.category)
      .reduce((s, t) => s + t.amount, 0)
    return { ...b, spent }
  })

  const openEdit = (category: string, currentLimit: number) => {
    setDialogMode("edit")
    setEditCategory(category)
    setEditNewName(category)
    setEditLimit(String(currentLimit))
    setDialogOpen(true)
  }

  const openAdd = () => {
    setDialogMode("add")
    setEditCategory("")
    setEditNewName("")
    setEditLimit("")
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!editNewName.trim() || !editLimit || Number.parseFloat(editLimit) < 0) return
    if (dialogMode === "add") {
      onAddBudget(editNewName.trim(), Number.parseFloat(editLimit))
    } else {
      if (editNewName.trim() !== editCategory) {
        onRenameBudget(editCategory, editNewName.trim())
      }
      onUpdateBudget(editNewName.trim(), Number.parseFloat(editLimit))
    }
    setDialogOpen(false)
  }

  const handleDelete = (category: string) => {
    onDeleteBudget(category)
    setDeleteConfirm(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("budgets.title")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("budgets.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPresetsOpen(true)} className="gap-2">
            <Sparkles className="h-4 w-4" /> {t("budgets.seasonalPresets")}
          </Button>
          <Button onClick={openAdd} className="gap-2">
            <Plus className="h-4 w-4" /> {t("budgets.addCategory")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {calculatedBudgets.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
            {t("budgets.noCategories")}
          </div>
        )}
        {calculatedBudgets.map((b) => {
          const pct = b.limit > 0 ? Math.min((b.spent / b.limit) * 100, 100) : 0
          return (
            <Card key={b.category} className="relative">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{t("categories." + b.category)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {formatCurrency(b.spent)} {t("budgets.of")} {formatCurrency(b.limit)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(b.category, b.limit)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(b.category)}>
                      <Trash2 className="h-4 w-4 text-coral" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Progress value={pct} indicatorColor={getProgressColor(pct)} />
                  <div className="flex justify-between text-xs">
                    <span className={pct >= 100 ? "text-coral font-medium" : pct >= 75 ? "text-amber-500 font-medium" : "text-gray-400"}>
                      {pct.toFixed(0)}{t("budgets.used")}
                    </span>
                    <span className="text-gray-400">
                      {formatCurrency(Math.max(b.limit - b.spent, 0))} {t("budgets.remaining")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "add" ? t("budgets.addCategoryTitle") : t("budgets.editBudget")}</DialogTitle>
            <DialogDescription>
              {dialogMode === "add" ? t("budgets.addCategoryTitle") : editCategory}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("budgets.categoryName")}</Label>
              <Input
                id="name"
                value={editNewName}
                onChange={(e) => setEditNewName(e.target.value)}
                placeholder={t("budgets.categoryNamePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="limit">{t("budgets.monthlyLimit")}</Label>
              <Input
                id="limit"
                type="number"
                step="0.01"
                min="0"
                value={editLimit}
                onChange={(e) => setEditLimit(e.target.value)}
                placeholder={t("common.amountPlaceholder")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("budgets.cancel")}</Button>
            <Button onClick={handleSave}>{dialogMode === "add" ? t("budgets.add") : t("budgets.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={presetsOpen} onOpenChange={(o) => { if (!o) { setPresetsOpen(false); setSelectedPreset(null) } }}>
        <DialogContent className="sm:max-w-lg">
          {selectedPreset === null ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-600" /> {t("budgets.presetsTitle")}
                </DialogTitle>
                <DialogDescription>
                  {t("budgets.presetsDesc")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                {presets.map((preset) => {
                  const Icon = preset.icon
                  return (
                    <div key={preset.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t(preset.nameKey)}</h3>
                            <Button size="sm" onClick={() => selectPreset(preset.id)}>{t("budgets.customize")}</Button>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t(preset.descKey)}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setPresetsOpen(false); setSelectedPreset(null) }}>{t("budgets.close")}</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-600" /> {t("budgets.customizeTitle")}
                </DialogTitle>
                <DialogDescription>
                  {t("budgets.customizeDesc")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2 max-h-80 overflow-y-auto">
                {customizations.map((adj, i) => {
                  const existing = budgets.find((b) => b.category === adj.category)
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <input
                        type="checkbox"
                        checked={adj.enabled}
                        onChange={(e) => {
                          const updated = [...customizations]
                          updated[i] = { ...updated[i], enabled: e.target.checked }
                          setCustomizations(updated)
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 shrink-0"
                      />
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">{t("budgets.categoryName")}</Label>
                          <Input
                            value={adj.category}
                            onChange={(e) => {
                              const updated = [...customizations]
                              updated[i] = { ...updated[i], category: e.target.value }
                              setCustomizations(updated)
                            }}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t("budgets.limit")}</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={adj.amount || ""}
                            onChange={(e) => {
                              const updated = [...customizations]
                              updated[i] = { ...updated[i], amount: Number.parseFloat(e.target.value) || 0 }
                              setCustomizations(updated)
                            }}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                      <div className="shrink-0 text-xs text-gray-400 w-16 text-right">
                        {existing ? t("budgets.boost") : t("budgets.new")}
                      </div>
                    </div>
                  )
                })}
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setSelectedPreset(null)}>{t("budgets.back")}</Button>
                <Button onClick={applyCustomizations} disabled={!customizations.some((a) => a.enabled)}>
                  {t("budgets.applySelected")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirm !== null} onOpenChange={(o) => { if (!o) setDeleteConfirm(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("budgets.deleteCategory")}</DialogTitle>
            <DialogDescription>
              {t("budgets.deleteConfirm", { category: deleteConfirm || "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>{t("budgets.cancel")}</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>{t("budgets.deleteCategory")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
