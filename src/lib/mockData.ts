import type { Transaction, Budget, SavingsGoal } from "../types"
import { generateId } from "./utils"

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split("T")[0]
}

export function getMockTransactions(): Transaction[] {
  return [
    { id: generateId(), date: daysAgo(28), description: "Grocery Store", category: "Food & Dining", amount: 156.32, type: "expense" },
    { id: generateId(), date: daysAgo(25), description: "Monthly Salary", category: "Salary", amount: 5200.00, type: "income" },
    { id: generateId(), date: daysAgo(22), description: "Electric Bill", category: "Utilities", amount: 98.50, type: "expense" },
    { id: generateId(), date: daysAgo(20), description: "Netflix Subscription", category: "Entertainment", amount: 15.99, type: "expense" },
    { id: generateId(), date: daysAgo(18), description: "Gas Station", category: "Transportation", amount: 45.00, type: "expense" },
    { id: generateId(), date: daysAgo(16), description: "Freelance Project", category: "Freelance", amount: 850.00, type: "income" },
    { id: generateId(), date: daysAgo(14), description: "Restaurant Dinner", category: "Food & Dining", amount: 67.80, type: "expense" },
    { id: generateId(), date: daysAgo(12), description: "Water Bill", category: "Utilities", amount: 42.15, type: "expense" },
    { id: generateId(), date: daysAgo(10), description: "New Sneakers", category: "Shopping", amount: 120.00, type: "expense" },
    { id: generateId(), date: daysAgo(8), description: "Uber Rides", category: "Transportation", amount: 34.50, type: "expense" },
    { id: generateId(), date: daysAgo(6), description: "Doctor Visit", category: "Healthcare", amount: 75.00, type: "expense" },
    { id: generateId(), date: daysAgo(4), description: "Online Course", category: "Education", amount: 199.00, type: "expense" },
    { id: generateId(), date: daysAgo(2), description: "Dividend Payment", category: "Investment", amount: 120.00, type: "income" },
    { id: generateId(), date: daysAgo(1), description: "Coffee Shop", category: "Food & Dining", amount: 5.75, type: "expense" },
    { id: generateId(), date: daysAgo(0), description: "Gym Membership", category: "Healthcare", amount: 49.99, type: "expense" },
  ]
}

export const MOCK_SALARY = 5200

export const MOCK_EMERGENCY_FUND_MONTHS = 0
export const MOCK_EMERGENCY_FUND_SAVED = 0
export const MOCK_SAVINGS_GOALS: SavingsGoal[] = []

export function getMockBudgets(): Budget[] {
  return [
    { category: "Food & Dining", limit: 600, spent: 229.87 },
    { category: "Transportation", limit: 200, spent: 79.50 },
    { category: "Utilities", limit: 250, spent: 140.65 },
    { category: "Entertainment", limit: 150, spent: 15.99 },
    { category: "Shopping", limit: 300, spent: 120.00 },
    { category: "Healthcare", limit: 200, spent: 124.99 },
    { category: "Education", limit: 300, spent: 199.00 },
    { category: "Housing", limit: 1400, spent: 0 },
    { category: "Savings", limit: 500, spent: 0 },
    { category: "Other", limit: 200, spent: 0 },
  ]
}
