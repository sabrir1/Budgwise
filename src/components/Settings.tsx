import { useRef, useState } from "react"
import { Download, Upload, AlertTriangle, Moon, Sun, DollarSign, Target, Plus, Trash2, Gem, CalendarDays } from "lucide-react"
import type { Transaction, Budget, SavingsGoal } from "../types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"
import { Progress } from "./ui/progress"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "./ui/dialog"
import { formatCurrency } from "../lib/utils"
import { useLocale } from "../lib/LocaleContext"

interface SettingsProps {
  theme: "light" | "dark"
  onToggleTheme: () => void
  transactions: Transaction[]
  budgets: Budget[]
  monthlySalary: number
  emergencyFundMonths: number
  emergencyFundSaved: number
  savingsGoals: SavingsGoal[]
  alternativeCalendar: boolean
  onToggleAlternativeCalendar: () => void
  onSetSalary: (salary: number) => void
  onSetEmergencyFund: (months: number, saved: number) => void
  onAddSavingsGoal: (goal: SavingsGoal) => void
  onUpdateSavingsGoal: (index: number, goal: SavingsGoal) => void
  onDeleteSavingsGoal: (index: number) => void
  onImport: (data: { transactions: Transaction[]; budgets: Budget[]; monthlySalary?: number; emergencyFundMonths?: number; emergencyFundSaved?: number; savingsGoals?: SavingsGoal[] }) => void
  onReset: () => void
}

function getProgressColor(pct: number): string {
  if (pct >= 100) return "#f43f5e"
  if (pct >= 75) return "#f59e0b"
  return "#10b981"
}

export default function Settings({
  theme, onToggleTheme, transactions, budgets, monthlySalary,
  emergencyFundMonths, emergencyFundSaved, savingsGoals,
  alternativeCalendar, onToggleAlternativeCalendar,
  onSetSalary, onSetEmergencyFund, onAddSavingsGoal, onUpdateSavingsGoal, onDeleteSavingsGoal,
  onImport, onReset,
}: SettingsProps) {
  const { t } = useLocale()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importFeedback, setImportFeedback] = useState<{ message: string; isSuccess: boolean } | null>(null)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [efMonths, setEfMonths] = useState(String(emergencyFundMonths || 3))
  const [efSaved, setEfSaved] = useState(String(emergencyFundSaved))
  const [showEf, setShowEf] = useState(emergencyFundMonths > 0)

  const [goalDialogOpen, setGoalDialogOpen] = useState(false)
  const [goalName, setGoalName] = useState("")
  const [goalTarget, setGoalTarget] = useState("")
  const [goalDeadline, setGoalDeadline] = useState("")
  const [goalSaved, setGoalSaved] = useState("")
  const [editingGoalIdx, setEditingGoalIdx] = useState<number | null>(null)

  const avgMonthlyExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0)

  const handleExport = () => {
    const data = { transactions, budgets, monthlySalary, emergencyFundMonths, emergencyFundSaved, savingsGoals, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `budgetwise-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportFeedback(null)
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (data.transactions && data.budgets) {
          onImport(data)
          setImportFeedback({ message: t("settings.importSuccess"), isSuccess: true })
        } else {
          setImportFeedback({ message: t("settings.importInvalid"), isSuccess: false })
        }
      } catch {
        setImportFeedback({ message: t("settings.importParseError"), isSuccess: false })
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const handleEmergencyFundSave = () => {
    onSetEmergencyFund(showEf ? Number.parseInt(efMonths) || 3 : 0, Number.parseFloat(efSaved) || 0)
  }

  const openGoalDialog = (idx?: number) => {
    if (idx !== undefined) {
      const g = savingsGoals[idx]
      setGoalName(g.name)
      setGoalTarget(String(g.targetAmount))
      setGoalDeadline(String(g.deadlineMonths))
      setGoalSaved(String(g.savedAmount))
      setEditingGoalIdx(idx)
    } else {
      setGoalName("")
      setGoalTarget("")
      setGoalDeadline("")
      setGoalSaved("")
      setEditingGoalIdx(null)
    }
    setGoalDialogOpen(true)
  }

  const handleGoalSave = () => {
    if (!goalName.trim() || !goalTarget) return
    const goal: SavingsGoal = {
      name: goalName.trim(),
      targetAmount: Number.parseFloat(goalTarget) || 0,
      deadlineMonths: Number.parseInt(goalDeadline) || 0,
      savedAmount: Number.parseFloat(goalSaved) || 0,
      createdAt: new Date().toISOString(),
    }
    if (editingGoalIdx !== null) {
      onUpdateSavingsGoal(editingGoalIdx, goal)
    } else {
      onAddSavingsGoal(goal)
    }
    setGoalDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("settings.title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("settings.subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.appearance")}</CardTitle>
          <CardDescription>{t("settings.appearanceDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon className="h-5 w-5 text-gray-500" /> : <Sun className="h-5 w-5 text-gray-500" />}
              <Label htmlFor="theme-toggle">{theme === "dark" ? t("settings.darkMode") : t("settings.lightMode")}</Label>
            </div>
            <Switch id="theme-toggle" checked={theme === "dark"} onCheckedChange={onToggleTheme} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.alternativeCalendar")}</CardTitle>
          <CardDescription>{t("settings.altCalendarDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-gray-500" />
              <Label htmlFor="alt-calendar-toggle">{t("settings.hijriCalendar")}</Label>
            </div>
            <Switch id="alt-calendar-toggle" checked={alternativeCalendar} onCheckedChange={onToggleAlternativeCalendar} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.salarySettings")}</CardTitle>
          <CardDescription>{t("settings.salaryDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-1.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("settings.monthlySalary")}</p>
              <p className="text-xl font-bold">{formatCurrency(monthlySalary)}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => { const v = prompt(t("settings.enterSalary"), String(monthlySalary)); if (v) onSetSalary(Number.parseFloat(v) || 0) }}>{t("settings.change")}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.savingsGoals")}</CardTitle>
          <CardDescription>{t("settings.savingsDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-1.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{t("settings.emergencyFund")}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t("settings.emergencyFundDesc")}</p>
              </div>
            </div>
            <Switch checked={showEf} onCheckedChange={(v) => { setShowEf(v); if (!v) onSetEmergencyFund(0, 0) }} />
          </div>
          {showEf && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-11">
              <div className="space-y-1">
                <Label className="text-xs">{t("settings.months")}</Label>
                <Input type="number" min="1" max="12" value={efMonths} onChange={(e) => setEfMonths(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("settings.savedSoFar")}</Label>
                <Input type="number" step="0.01" min="0" value={efSaved} onChange={(e) => setEfSaved(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">&nbsp;</Label>
                <Button className="w-full" onClick={handleEmergencyFundSave}>{t("settings.save")}</Button>
              </div>
            </div>
          )}
          {showEf && emergencyFundMonths > 0 && (
            <div className="pl-11 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t("settings.target")}: {formatCurrency(avgMonthlyExpense * emergencyFundMonths)}</span>
                <span className="font-medium">{((emergencyFundSaved / Math.max(avgMonthlyExpense * emergencyFundMonths, 1)) * 100).toFixed(0)}%</span>
              </div>
              <Progress value={Math.min((emergencyFundSaved / Math.max(avgMonthlyExpense * emergencyFundMonths, 1)) * 100, 100)} indicatorColor={getProgressColor((emergencyFundSaved / Math.max(avgMonthlyExpense * emergencyFundMonths, 1)) * 100)} />
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Gem className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900 dark:text-gray-100">{t("settings.bigPurchaseGoals")}</span>
              </div>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => openGoalDialog()}>
                <Plus className="h-4 w-4" /> {t("settings.addGoal")}
              </Button>
            </div>
            {savingsGoals.length === 0 && (
              <p className="text-sm text-gray-400 pl-7">{t("settings.noGoals")}</p>
            )}
            {savingsGoals.map((goal, i) => {
              const pct = (goal.savedAmount / Math.max(goal.targetAmount, 1)) * 100
              return (
                <div key={i} className="flex items-center gap-3 pl-7 py-2 group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{goal.name}</p>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openGoalDialog(i)}>
                          <Gem className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDeleteSavingsGoal(i)}>
                          <Trash2 className="h-3.5 w-3.5 text-coral" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{formatCurrency(goal.savedAmount)} / {formatCurrency(goal.targetAmount)}</span>
                      <span>{goal.deadlineMonths > 0 ? `${goal.deadlineMonths}${t("settings.monthAbbrev")}` : t("settings.noDeadline")}</span>
                    </div>
                    <Progress value={Math.min(pct, 100)} indicatorColor={getProgressColor(pct)} />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGoalIdx !== null ? t("settings.editGoal") : t("settings.newGoal")}</DialogTitle>
            <DialogDescription>{t("settings.goalDialogDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="gname">{t("settings.goalName")}</Label>
              <Input id="gname" value={goalName} onChange={(e) => setGoalName(e.target.value)} placeholder={t("settings.goalNamePlaceholder")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gtarget">{t("settings.targetAmount")}</Label>
                <Input id="gtarget" type="number" step="0.01" min="0" value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gdeadline">{t("settings.deadlineMonths")}</Label>
                <Input id="gdeadline" type="number" min="0" value={goalDeadline} onChange={(e) => setGoalDeadline(e.target.value)} placeholder={t("settings.noDeadline")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gsaved">{t("settings.alreadySaved")}</Label>
              <Input id="gsaved" type="number" step="0.01" min="0" value={goalSaved} onChange={(e) => setGoalSaved(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGoalDialogOpen(false)}>{t("settings.cancel")}</Button>
            <Button onClick={handleGoalSave}>{editingGoalIdx !== null ? t("settings.updateGoal") : t("settings.addGoal")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.backupRestore")}</CardTitle>
          <CardDescription>{t("settings.backupDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" /> {t("settings.exportData")}
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
              <Upload className="h-4 w-4" /> {t("settings.importData")}
            </Button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          </div>
          {importFeedback && (
            <p className={`text-sm ${importFeedback.isSuccess ? "text-emerald-600" : "text-coral"}`}>
              {importFeedback.message}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-coral">{t("settings.dangerZone")}</CardTitle>
          <CardDescription>{t("settings.dangerDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <AlertTriangle className="h-4 w-4" /> {t("settings.clearAllData")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("settings.confirmDelete")}</DialogTitle>
                <DialogDescription>
                  {t("settings.confirmDeleteDesc")}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setResetDialogOpen(false)}>{t("settings.cancel")}</Button>
                <Button variant="destructive" onClick={() => { onReset(); setResetDialogOpen(false) }}>{t("settings.yesDelete")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
