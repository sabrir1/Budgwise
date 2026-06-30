import { useLocalStorage } from "./useLocalStorage"

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<"light" | "dark">("budgetwise-theme", "light")

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  return { theme, toggleTheme }
}
