export interface Transaction {
  id: string
  date: string
  description: string
  category: string
  amount: number
  type: "income" | "expense"
}

export interface Budget {
  category: string
  limit: number
  spent: number
}

export interface SavingsGoal {
  name: string
  targetAmount: number
  savedAmount: number
  deadlineMonths: number
  createdAt: string
}

export interface WealthAsset {
  id: string
  name: string
  type: "cash" | "precious_metals" | "investment_portfolio" | "real_estate" | "other"
  value: number
}

export interface AppData {
  transactions: Transaction[]
  budgets: Budget[]
  monthlySalary: number
  emergencyFundMonths: number
  emergencyFundSaved: number
  savingsGoals: SavingsGoal[]
  alternativeCalendar: boolean
  wealthAssets: WealthAsset[]
  wealthTimeline: "lunar" | "solar"
  wealthContributionEnabled: boolean
  wealthContribution: number
}

export type View = "dashboard" | "transactions" | "budgets" | "wealth" | "settings"

export const CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Healthcare",
  "Education",
  "Housing",
  "Savings",
  "Other",
] as const

export type Category = (typeof CATEGORIES)[number]
