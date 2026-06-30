const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

export interface SpendingSummary {
  totalIncome: number
  totalExpenses: number
  balance: number
  monthlySalary: number
  topCategories: { category: string; amount: number; pct: number }[]
  budgets: { category: string; limit: number; spent: number; pct: number }[]
  transactionCount: number
}

export async function getSpendingRecommendations(summary: SpendingSummary): Promise<string> {
  const prompt = `You are a financial advisor. Analyze this user's monthly spending and give 3-4 concise, actionable recommendations to improve their financial health.

DATA:
- Monthly Salary: $${summary.monthlySalary}
- Total Income (this period): $${summary.totalIncome}
- Total Expenses: $${summary.totalExpenses}
- Balance: $${summary.balance}
- Transaction count: ${summary.transactionCount}

Top spending categories:
${summary.topCategories.map((c) => `  - ${c.category}: $${c.amount} (${c.pct.toFixed(1)}% of expenses)`).join("\n")}

Budget utilization:
${summary.budgets.map((b) => `  - ${b.category}: $${b.spent} / $${b.limit} (${b.pct.toFixed(0)}% used)`).join("\n")}

Format your response as 3-4 short bullet points (each 1-2 sentences). Be specific using their actual numbers. Tone: helpful, encouraging, professional.`

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    }),
  })

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content ?? "Unable to generate recommendations."
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export async function parseTransactionFromText(text: string): Promise<{ description: string; amount: number; category: string }> {
  const systemPrompt = `You are a transaction parser. Parse the user's text into a JSON object with exactly these fields: description (string), amount (number, negative for expenses, positive for income), category (string, must be one of: Food & Dining, Transportation, Utilities, Entertainment, Shopping, Healthcare, Education, Housing, Savings, Other, Salary, Freelance, Investment). Return ONLY valid JSON, no explanation. Examples:
- "spent 50 on pizza" → {"description": "Pizza", "amount": -50, "category": "Food & Dining"}
- "paid rent 1500" → {"description": "Rent", "amount": -1500, "category": "Housing"}
- "got salary 5000" → {"description": "Monthly Salary", "amount": 5000, "category": "Salary"}
- "bought groceries for 85.50" → {"description": "Groceries", "amount": -85.5, "category": "Food & Dining"}`

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      temperature: 0.1,
      max_tokens: 200,
    }),
  })

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`)
  }

  const data = await response.json()
  const raw = data.choices?.[0]?.message?.content ?? ""
  const parsed = JSON.parse(raw)
  return {
    description: parsed.description ?? "Unknown",
    amount: typeof parsed.amount === "number" ? parsed.amount : Number.parseFloat(parsed.amount) || 0,
    category: parsed.category ?? "Other",
  }
}

export async function chatWithAI(
  messages: ChatMessage[],
  context: SpendingSummary,
): Promise<string> {
  const systemPrompt = `You are a helpful financial assistant integrated into the user's budgeting app. You have access to their financial data below. Answer their questions conversationally — give advice on saving, budgeting, investing, cutting costs, etc. Be specific using their actual numbers where relevant. Keep responses concise (2-4 sentences per point).

CURRENT FINANCIAL DATA:
- Monthly Salary: QR ${context.monthlySalary}
- Total Income (this period): QR ${context.totalIncome}
- Total Expenses: QR ${context.totalExpenses}
- Balance: QR ${context.balance}
- Transactions recorded: ${context.transactionCount}

Top spending categories:
${context.topCategories.map((c) => `  - ${c.category}: QR ${c.amount} (${c.pct.toFixed(1)}% of expenses)`).join("\n")}

Budget utilization:
${context.budgets.map((b) => `  - ${b.category}: QR ${b.spent} / QR ${b.limit} (${b.pct.toFixed(0)}% used)`).join("\n")}`

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.7,
      max_tokens: 600,
    }),
  })

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content ?? "Sorry, I couldn't process that."
}
