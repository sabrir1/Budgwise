export function formatHijri(dateString: string): string {
  const d = new Date(dateString + "T12:00:00")
  return new Intl.DateTimeFormat("en-u-ca-islamic", {
    day: "numeric", month: "long", year: "numeric",
  }).format(d)
}

export function getHijriMonthName(dateString: string): string {
  const d = new Date(dateString + "T12:00:00")
  return new Intl.DateTimeFormat("en-u-ca-islamic", {
    month: "long",
  }).format(d)
}
