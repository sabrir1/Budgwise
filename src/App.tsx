import { useState } from "react"
import type { View, Transaction, Budget, SavingsGoal, WealthAsset, AppData } from "./types"
import { useLocalStorage } from "./hooks/useLocalStorage"
import { useTheme } from "./hooks/useTheme"
import { getMockTransactions, getMockBudgets, MOCK_SALARY, MOCK_EMERGENCY_FUND_MONTHS, MOCK_EMERGENCY_FUND_SAVED, MOCK_SAVINGS_GOALS } from "./lib/mockData"
import { generateId } from "./lib/utils"
import Layout from "./components/Layout"
import Dashboard from "./components/Dashboard"
import TransactionLedger from "./components/TransactionLedger"
import BudgetManagement from "./components/BudgetManagement"
import WealthPlanning from "./components/WealthPlanning"
import Settings from "./components/Settings"
const STORAGE_KEY = "budgetwise-data"

function getInitialData(): AppData {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      return {
        transactions: parsed.transactions ?? getMockTransactions(),
        budgets: parsed.budgets ?? getMockBudgets(),
        monthlySalary: parsed.monthlySalary ?? MOCK_SALARY,
        emergencyFundMonths: parsed.emergencyFundMonths ?? 0,
        emergencyFundSaved: parsed.emergencyFundSaved ?? 0,
        savingsGoals: parsed.savingsGoals ?? [],
        alternativeCalendar: parsed.alternativeCalendar ?? false,
        wealthAssets: parsed.wealthAssets ?? [],
        wealthTimeline: parsed.wealthTimeline ?? "lunar",
        wealthContributionEnabled: parsed.wealthContributionEnabled ?? false,
        wealthContribution: parsed.wealthContribution ?? 0,
      }
    } catch {
      // fall through
    }
  }
  return {
    transactions: getMockTransactions(),
    budgets: getMockBudgets(),
    monthlySalary: MOCK_SALARY,
    emergencyFundMonths: 0,
    emergencyFundSaved: 0,
    savingsGoals: [],
    alternativeCalendar: false,
    wealthAssets: [],
    wealthTimeline: "lunar",
    wealthContributionEnabled: false,
    wealthContribution: 0,
  }
}

export default function App() {
  const [view, setView] = useState<View>("dashboard")
  const { theme, toggleTheme } = useTheme()
  const [data, setData] = useLocalStorage<AppData>(STORAGE_KEY, getInitialData())

  const addTransaction = (t: Omit<Transaction, "id">) => {
    setData((prev) => ({
      ...prev,
      transactions: [{ ...t, id: generateId() }, ...prev.transactions],
    }))
  }

  const updateTransaction = (id: string, t: Omit<Transaction, "id">) => {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.map((tx) => (tx.id === id ? { ...t, id } : tx)),
    }))
  }

  const deleteTransaction = (id: string) => {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((tx) => tx.id !== id),
    }))
  }

  const updateBudget = (category: string, limit: number) => {
    setData((prev) => ({
      ...prev,
      budgets: prev.budgets.map((b) => (b.category === category ? { ...b, limit } : b)),
    }))
  }

  const addBudget = (category: string, limit: number) => {
    setData((prev) => ({
      ...prev,
      budgets: [...prev.budgets, { category, limit, spent: 0 }],
    }))
  }

  const renameBudget = (oldCategory: string, newCategory: string) => {
    setData((prev) => ({
      ...prev,
      budgets: prev.budgets.map((b) =>
        b.category === oldCategory ? { ...b, category: newCategory } : b,
      ),
    }))
  }

  const deleteBudget = (category: string) => {
    setData((prev) => ({
      ...prev,
      budgets: prev.budgets.filter((b) => b.category !== category),
    }))
  }

  const toggleAlternativeCalendar = () => {
    setData((prev) => ({ ...prev, alternativeCalendar: !prev.alternativeCalendar }))
  }

  const addWealthAsset = (asset: WealthAsset) => {
    setData((prev) => ({ ...prev, wealthAssets: [...prev.wealthAssets, asset] }))
  }

  const updateWealthAsset = (asset: WealthAsset) => {
    setData((prev) => ({
      ...prev,
      wealthAssets: prev.wealthAssets.map((a) => (a.id === asset.id ? asset : a)),
    }))
  }

  const deleteWealthAsset = (id: string) => {
    setData((prev) => ({
      ...prev,
      wealthAssets: prev.wealthAssets.filter((a) => a.id !== id),
    }))
  }

  const setWealthTimeline = (t: "lunar" | "solar") => {
    setData((prev) => ({ ...prev, wealthTimeline: t }))
  }

  const setWealthContributionEnabled = (enabled: boolean) => {
    setData((prev) => ({
      ...prev,
      wealthContributionEnabled: enabled,
      wealthContribution: enabled ? prev.wealthContribution : 0,
    }))
  }

  const setWealthContribution = (amount: number) => {
    setData((prev) => ({ ...prev, wealthContribution: amount }))
  }

  const importData = (imported: { transactions: Transaction[]; budgets: Budget[]; monthlySalary?: number; emergencyFundMonths?: number; emergencyFundSaved?: number; savingsGoals?: SavingsGoal[] }) => {
    setData({
      transactions: imported.transactions,
      budgets: imported.budgets,
      monthlySalary: imported.monthlySalary ?? MOCK_SALARY,
      emergencyFundMonths: imported.emergencyFundMonths ?? 0,
      emergencyFundSaved: imported.emergencyFundSaved ?? 0,
      savingsGoals: imported.savingsGoals ?? [],
      alternativeCalendar: false,
      wealthAssets: [],
      wealthTimeline: "lunar",
      wealthContributionEnabled: false,
      wealthContribution: 0,
    })
  }

  const setSalary = (salary: number) => {
    setData((prev) => ({ ...prev, monthlySalary: salary }))
  }

  const setEmergencyFund = (months: number, saved: number) => {
    setData((prev) => ({ ...prev, emergencyFundMonths: months, emergencyFundSaved: saved }))
  }

  const addSavingsGoal = (goal: SavingsGoal) => {
    setData((prev) => ({ ...prev, savingsGoals: [...prev.savingsGoals, goal] }))
  }

  const updateSavingsGoal = (index: number, goal: SavingsGoal) => {
    setData((prev) => {
      const updated = [...prev.savingsGoals]
      updated[index] = goal
      return { ...prev, savingsGoals: updated }
    })
  }

  const deleteSavingsGoal = (index: number) => {
    setData((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.filter((_, i) => i !== index),
    }))
  }

  const resetData = () => {
    localStorage.removeItem(STORAGE_KEY)
    setData({
      transactions: getMockTransactions(),
      budgets: getMockBudgets(),
      monthlySalary: MOCK_SALARY,
      emergencyFundMonths: 0,
      emergencyFundSaved: 0,
      savingsGoals: [],
      alternativeCalendar: false,
      wealthAssets: [],
      wealthTimeline: "lunar",
      wealthContributionEnabled: false,
      wealthContribution: 0,
    })
  }

  return (
    <Layout view={view} onViewChange={setView} theme={theme} onToggleTheme={toggleTheme} transactions={data.transactions} budgets={data.budgets} monthlySalary={data.monthlySalary} onAddTransaction={addTransaction}>
      {view === "dashboard" && (
        <Dashboard
          transactions={data.transactions}
          budgets={data.budgets}
          monthlySalary={data.monthlySalary}
          emergencyFundMonths={data.emergencyFundMonths}
          emergencyFundSaved={data.emergencyFundSaved}
          savingsGoals={data.savingsGoals}
          alternativeCalendar={data.alternativeCalendar}
          onSetSalary={setSalary}
          onAddIncome={() => setView("transactions")}
          onAddExpense={() => setView("transactions")}
        />
      )}
      {view === "transactions" && (
        <TransactionLedger
          transactions={data.transactions}
          budgets={data.budgets}
          alternativeCalendar={data.alternativeCalendar}
          onAdd={addTransaction}
          onUpdate={updateTransaction}
          onDelete={deleteTransaction}
        />
      )}
      {view === "budgets" && (
        <BudgetManagement
          budgets={data.budgets}
          transactions={data.transactions}
          onUpdateBudget={updateBudget}
          onAddBudget={addBudget}
          onRenameBudget={renameBudget}
          onDeleteBudget={deleteBudget}
        />
      )}
      {view === "wealth" && (
        <WealthPlanning
          assets={data.wealthAssets}
          timeline={data.wealthTimeline}
          contributionEnabled={data.wealthContributionEnabled}
          contributionAmount={data.wealthContribution}
          onAdd={addWealthAsset}
          onUpdate={updateWealthAsset}
          onDelete={deleteWealthAsset}
          onSetTimeline={setWealthTimeline}
          onSetContributionEnabled={setWealthContributionEnabled}
          onSetContributionAmount={setWealthContribution}
        />
      )}
      {view === "settings" && (
        <Settings
          theme={theme}
          onToggleTheme={toggleTheme}
          transactions={data.transactions}
          budgets={data.budgets}
          monthlySalary={data.monthlySalary}
          emergencyFundMonths={data.emergencyFundMonths}
          emergencyFundSaved={data.emergencyFundSaved}
          savingsGoals={data.savingsGoals}
          alternativeCalendar={data.alternativeCalendar}
          onToggleAlternativeCalendar={toggleAlternativeCalendar}
          onSetSalary={setSalary}
          onSetEmergencyFund={setEmergencyFund}
          onAddSavingsGoal={addSavingsGoal}
          onUpdateSavingsGoal={updateSavingsGoal}
          onDeleteSavingsGoal={deleteSavingsGoal}
          onImport={importData}
          onReset={resetData}
        />
      )}
    </Layout>
  )
}
