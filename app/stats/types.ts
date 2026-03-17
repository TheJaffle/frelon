export const WEEKS = 12

export type WeekRange = {
  label: string
  endDate: Date
}

export const WEEK_RANGES: WeekRange[] = (() => {
  const ranges: WeekRange[] = []
  let day = 9
  let month = 3
  const monthNames: Record<number, string> = { 3: "03", 4: "04", 5: "05", 6: "06" }
  const daysInMonth: Record<number, number> = { 3: 31, 4: 30, 5: 31, 6: 30 }

  for (let i = 0; i < 12; i++) {
    const startDay = day
    const startMonth = month
    let endDay = day + 6
    let endMonth = month

    if (endDay > daysInMonth[endMonth]) {
      endDay -= daysInMonth[endMonth]
      endMonth += 1
    }

    const label = `${String(startDay).padStart(2, "0")}/${monthNames[startMonth]}-${String(endDay).padStart(2, "0")}/${monthNames[endMonth]}`

    const year = new Date().getFullYear()
    const endDate = new Date(year, endMonth - 1, endDay, 23, 59, 59)

    ranges.push({ label, endDate })

    day += 7
    if (day > daysInMonth[month]) {
      day -= daysInMonth[month]
      month += 1
    }
  }
  return ranges
})()

export const WEEK_DATES: string[] = WEEK_RANGES.map((r) => r.label.split("-")[0])

export type WeekStat = {
  label: string
  asian: number
  europe: number
  declared: number
  totalUsers: number
  asianCumul: number
  europeCumul: number
}