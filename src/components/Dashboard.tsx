import { useMemo, useState } from "react"
import { TrendingUp, TrendingDown, Wallet, Target, Plus, Minus, DollarSign } from "lucide-react"
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts"
import type { Transaction, Budget as BudgetType, SavingsGoal } from "../types"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Label } from "./ui/label"
import { Progress } from "./ui/progress"
import { formatCurrency } from "../lib/utils"
import { getHijriMonthName } from "../lib/calendar"
import { useLocale } from "../lib/LocaleContext"

interface DashboardProps {
  transactions: Transaction[]
  budgets: BudgetType[]
  monthlySalary: number
  emergencyFundMonths: number
  emergencyFundSaved: number
  savingsGoals: SavingsGoal[]
  alternativeCalendar: boolean
  onSetSalary: (salary: number) => void
  onAddIncome: () => void
  onAddExpense: () => void
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16"]

function getProgressColor(pct: number): string {
  if (pct >= 100) return "#f43f5e"
  if (pct >= 75) return "#f59e0b"
  return "#10b981"
}

export default function Dashboard({ transactions, budgets, monthlySalary, emergencyFundMonths, emergencyFundSaved, savingsGoals, alternativeCalendar, onSetSalary, onAddIncome, onAddExpense }: DashboardProps) {
  const { t } = useLocale()
  const [salaryDialogOpen, setSalaryDialogOpen] = useState(false)
  const [salaryInput, setSalaryInput] = useState(String(monthlySalary))

  const stats = useMemo(() => {
    const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
    const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
    const totalBudget = budgets.reduce((s, b) => s + b.limit, 0)
    const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)
    return { income, expense, balance: income - expense, remainingBudget: totalBudget - totalSpent }
  }, [transactions, budgets])

  const salaryPct = monthlySalary > 0 ? (stats.expense / monthlySalary) * 100 : 0

  const categoryData = useMemo(() => {
    const map = new Map<string, number>()
    transactions.filter((t) => t.type === "expense").forEach((t) => {
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount)
    })
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [transactions])

  const monthlyData = useMemo(() => {
    const byMonth = new Map<string, { income: number; expense: number }>()
    transactions.forEach((t) => {
      const month = t.date.slice(0, 7)
      const entry = byMonth.get(month) ?? { income: 0, expense: 0 }
      if (t.type === "income") entry.income += t.amount
      else entry.expense += t.amount
      byMonth.set(month, entry)
    })
    return Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: alternativeCalendar
          ? `${new Date(month + "-01").toLocaleString("default", { month: "short" })} (${getHijriMonthName(month + "-01")})`
          : new Date(month + "-01").toLocaleString("default", { month: "short" }),
        ...data,
      }))
  }, [transactions, alternativeCalendar])

  const MetricCard = ({ title, value, icon: Icon, trend, color }: {
    title: string; value: string; icon: typeof Wallet; trend?: "up" | "down"; color: string
  }) => (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center bg-opacity-10 ${
            trend === "up" ? "bg-emerald-100 dark:bg-emerald-900/30" :
            trend === "down" ? "bg-coral/10" : "bg-gray-100 dark:bg-gray-800"
          }`}>
            <Icon className={`h-6 w-6 ${
              trend === "up" ? "text-emerald-600" :
              trend === "down" ? "text-coral" : "text-gray-500 dark:text-gray-400"
            }`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("dashboard.title")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onAddIncome} className="gap-2">
            <Plus className="h-4 w-4" /> {t("dashboard.income")}
          </Button>
          <Button onClick={onAddExpense} variant="destructive" className="gap-2">
            <Minus className="h-4 w-4" /> {t("dashboard.expense")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title={t("dashboard.totalBalance")} value={formatCurrency(stats.balance)} icon={Wallet} color="text-gray-900 dark:text-gray-100" />
        <MetricCard title={t("dashboard.monthlyIncome")} value={formatCurrency(stats.income)} icon={TrendingUp} trend="up" color="text-emerald-600" />
        <MetricCard title={t("dashboard.monthlyExpenses")} value={formatCurrency(stats.expense)} icon={TrendingDown} trend="down" color="text-coral" />
        <MetricCard title={t("dashboard.remainingBudget")} value={formatCurrency(stats.remainingBudget)} icon={Target} color="text-gray-900 dark:text-gray-100" />
      </div>

      <Card className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3 shrink-0">
              <div className="h-14 w-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <DollarSign className="h-7 w-7 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t("dashboard.monthlySalary")}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(monthlySalary)}</p>
              </div>
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{t("dashboard.spent")}: {formatCurrency(stats.expense)}</span>
                <span className="font-medium">{salaryPct.toFixed(1)}{t("dashboard.percentOfSalary")}</span>
              </div>
              <Progress value={Math.min(salaryPct, 100)} indicatorColor={getProgressColor(salaryPct)} />
              <div className="flex justify-between text-xs">
                <span className={salaryPct >= 100 ? "text-coral font-medium" : salaryPct >= 75 ? "text-amber-500 font-medium" : "text-emerald-600 font-medium"}>
                  {salaryPct >= 100 ? t("dashboard.overBudget") : `${formatCurrency(monthlySalary - stats.expense)} ${t("dashboard.remaining")}`}
                </span>
                <span className="text-gray-400">{t("dashboard.takeHome")}: {formatCurrency(monthlySalary - stats.expense)}</span>
              </div>
            </div>
            <Dialog open={salaryDialogOpen} onOpenChange={(o) => { setSalaryDialogOpen(o); if (o) setSalaryInput(String(monthlySalary)) }}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0">{t("dashboard.editSalary")}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("dashboard.setSalaryTitle")}</DialogTitle>
                  <DialogDescription>{t("dashboard.setSalaryDesc")}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary">{t("dashboard.monthlySalary")} ($)</Label>
                    <Input id="salary" type="number" step="0.01" min="0" value={salaryInput} onChange={(e) => setSalaryInput(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSalaryDialogOpen(false)}>{t("dashboard.cancel")}</Button>
                  <Button onClick={() => { onSetSalary(Number.parseFloat(salaryInput) || 0); setSalaryDialogOpen(false) }}>{t("dashboard.save")}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {((emergencyFundMonths > 0) || savingsGoals.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {emergencyFundMonths > 0 && (
            <Card className="border-emerald-200 dark:border-emerald-900/50">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Target className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{t("dashboard.emergencyFund")}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t("dashboard.monthTarget", { months: emergencyFundMonths })}</p>
                  </div>
                </div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-500 dark:text-gray-400">{t("dashboard.saved")}: {formatCurrency(emergencyFundSaved)}</span>
                  <span className="font-medium">{t("dashboard.target")}: {formatCurrency(stats.expense * emergencyFundMonths)}</span>
                </div>
                <Progress value={Math.min((emergencyFundSaved / Math.max(stats.expense * emergencyFundMonths, 1)) * 100, 100)} indicatorColor={getProgressColor((emergencyFundSaved / Math.max(stats.expense * emergencyFundMonths, 1)) * 100)} />
              </CardContent>
            </Card>
          )}
          {savingsGoals.map((goal) => {
            const pct = (goal.savedAmount / Math.max(goal.targetAmount, 1)) * 100
            return (
              <Card key={goal.name} className="border-blue-200 dark:border-blue-900/50">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{goal.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {goal.deadlineMonths > 0 ? t("dashboard.monthTarget", { months: goal.deadlineMonths }) : t("dashboard.noDeadline")}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-500 dark:text-gray-400">{t("dashboard.saved")}: {formatCurrency(goal.savedAmount)}</span>
                    <span className="font-medium">{t("dashboard.target")}: {formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <Progress value={Math.min(pct, 100)} indicatorColor={getProgressColor(pct)} />
                  {goal.deadlineMonths > 0 && (
                    <p className="text-xs text-gray-400 mt-2">
                      {t("dashboard.needPerMonth", { amount: formatCurrency((goal.targetAmount - goal.savedAmount) / goal.deadlineMonths) })}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("dashboard.spendingByCategory")}</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="flex items-center gap-6">
                <div className="w-48 h-48 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                        {categoryData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => typeof v === "number" ? formatCurrency(v) : v} labelFormatter={(label) => t("categories." + label)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2 max-h-48 overflow-y-auto">
                  {categoryData.slice(0, 8).map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2 text-sm">
                      <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600 dark:text-gray-400 flex-1 truncate">{t("categories." + item.name)}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm py-8 text-center">{t("dashboard.noExpenseData")}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("dashboard.incomeVsExpenses")}</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="currentColor" opacity={0.4} />
                  <YAxis tick={{ fontSize: 12 }} stroke="currentColor" opacity={0.4} />
                  <Tooltip formatter={(v) => typeof v === "number" ? formatCurrency(v) : v} />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name={t("dashboard.chartIncome")} />
                  <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name={t("dashboard.chartExpenses")} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm py-8 text-center">{t("dashboard.noData")}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
