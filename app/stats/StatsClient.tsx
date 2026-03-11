"use client"

import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"
import type { WeekStat } from "./types"

type Props = {
    weekStats: WeekStat[]
}

export default function StatsClient({ weekStats }: Props) {
    return (
        <div className="flex flex-col gap-6">

            {/* Chart 1 — Weekly captures (bars) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-sm font-semibold text-amber-800 mb-4 text-center">
                    Captures par semaine — tous piégeurs
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weekStats} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3e8c8" />
                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 10, fill: "#92400e" }}
                            angle={-40}
                            textAnchor="end"
                            interval={0}
                        />
                        <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} allowDecimals={false} />
                        <Tooltip
                            contentStyle={{ borderRadius: "8px", border: "1px solid #fde68a", fontSize: 12 }}
                            formatter={(value, name) => {
                                const labels: Record<string, string> = {
                                    asian: "🐝 Asiatiques",
                                    europe: "🟡 Européens",
                                }
                                return [value, labels[String(name)] ?? name]
                            }}
                        />
                        <Legend
                            formatter={(value) => {
                                const labels: Record<string, string> = {
                                    asian: "🐝 Asiatiques",
                                    europe: "🟡 Européens",
                                }
                                return <span style={{ fontSize: 12, color: "#374151" }}>{labels[value] ?? value}</span>
                            }}
                            wrapperStyle={{ paddingTop: 8 }}
                        />
                        <Bar dataKey="asian" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="europe" fill="#fcd34d" radius={[3, 3, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Chart 2 — Running cumulative totals (lines) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-sm font-semibold text-amber-800 mb-4 text-center">
                    Cumul des captures sur la période
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weekStats} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3e8c8" />
                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 10, fill: "#92400e" }}
                            angle={-40}
                            textAnchor="end"
                            interval={0}
                        />
                        <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} allowDecimals={false} />
                        <Tooltip
                            contentStyle={{ borderRadius: "8px", border: "1px solid #fde68a", fontSize: 12 }}
                            formatter={(value, name) => {
                                const labels: Record<string, string> = {
                                    asianCumul: "🐝 Asiatiques (cumul)",
                                    europeCumul: "🟡 Européens (cumul)",
                                }
                                return [value, labels[String(name)] ?? name]
                            }}
                        />
                        <Legend
                            formatter={(value) => {
                                const labels: Record<string, string> = {
                                    asianCumul: "🐝 Cumul asiatiques",
                                    europeCumul: "🟡 Cumul européens",
                                }
                                return <span style={{ fontSize: 12, color: "#374151" }}>{labels[value] ?? value}</span>
                            }}
                            wrapperStyle={{ paddingTop: 8 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="asianCumul"
                            stroke="#b45309"
                            strokeWidth={2}
                            dot={{ r: 4, fill: "#b45309" }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="europeCumul"
                            stroke="#d97706"
                            strokeWidth={2}
                            strokeDasharray="6 3"
                            dot={{ r: 4, fill: "#d97706" }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

        </div>
    )
}