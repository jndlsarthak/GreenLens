"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { useScanStore } from "@/store/scanStore"
import { StatCard } from "@/components/shared/StatCard"
import { ScanLine, Award, Leaf, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductCard } from "@/components/shared/ProductCard"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts"
import { userApi } from "@/lib/api"

export default function DashboardPage() {
    const { user, token } = useAuthStore()
    const { recentScans } = useScanStore()
    const [topCategories, setTopCategories] = useState<Array<{ category: string; count: number }>>([])

    useEffect(() => {
        if (token) {
            userApi(token)
                .stats()
                .then((stats) => setTopCategories(stats.topCategories ?? []))
                .catch(() => setTopCategories([]))
        }
    }, [token])

    const totalScans = recentScans.length
    const totalCarbon = recentScans.reduce((acc, scan) => acc + scan.carbonFootprint, 0)
    const level = user ? Math.floor(user.points / 100) + 1 : 0

    // Build weekly activity from recent scans (last 7 days)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const activityByDay = dayNames.map((name, i) => ({ name, scans: 0 }))
    recentScans.forEach((scan) => {
        const d = new Date(scan.date)
        const dayIndex = d.getDay()
        activityByDay[dayIndex].scans += 1
    })

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {user?.name || "there"}!</p>
            </div>

            {/* Stats Overview - all from real data */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Scans"
                    value={totalScans}
                    icon={ScanLine}
                    description={totalScans === 0 ? "Scan products to start" : "Your scans"}
                />
                <StatCard
                    title="Points"
                    value={user?.points ?? 0}
                    icon={Zap}
                    description={`Level ${level}`}
                />
                <StatCard
                    title="Carbon Tracked"
                    value={`${totalCarbon.toFixed(1)} kg`}
                    icon={Leaf}
                    description="CO₂e from scans"
                />
                <StatCard
                    title="Badges"
                    value="—"
                    icon={Award}
                    description="Earn by scanning"
                />
            </div>

            {/* Charts - activity from real scans */}
            <div className="grid gap-4 md:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Weekly activity</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={activityByDay}>
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="scans"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentScans.slice(0, 3).map((scan, i) => (
                                <div key={i} className="flex items-center">
                                    <div className="w-9 h-9 rounded bg-muted mr-3"></div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{scan.name}</p>
                                        <p className="text-xs text-muted-foreground">{scan.brand}</p>
                                    </div>
                                    <div className="ml-auto font-medium text-xs">+{scan.pointsEarned} pts</div>
                                </div>
                            ))}
                            {recentScans.length === 0 && (
                                <p className="text-sm text-muted-foreground">No recent activity.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Category Breakdown */}
            {topCategories.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Top Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topCategories}>
                                    <XAxis
                                        dataKey="category"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
