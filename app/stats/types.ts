export const WEEKS = 12

export const WEEK_DATES: string[] = (() => {
  const dates: string[] = []
  let day = 9
  let month = 3
  const monthNames: Record<number, string> = { 3: "03", 4: "04", 5: "05" }
  const daysInMonth: Record<number, number> = { 3: 31, 4: 30, 5: 31 }
  for (let i = 0; i < 12; i++) {
    const startDay = day
    const startMonth = month
    let endDay = day + 6
    let endMonth = month
    if (endDay > daysInMonth[endMonth]) {
      endDay -= daysInMonth[endMonth]
      endMonth += 1
    }
    dates.push(
      `S${i + 1} ${String(startDay).padStart(2, "0")}/${monthNames[startMonth]}`
    )
    day += 7
    if (day > daysInMonth[month]) {
      day -= daysInMonth[month]
      month += 1
    }
  }
  return dates
})()

export type WeekStat = {
  label: string
  asian: number
  europe: number
  total: number
  asianCumul: number
  europeCumul: number
}