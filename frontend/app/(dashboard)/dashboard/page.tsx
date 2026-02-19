"use client"

import { useAuthStore } from "@/store/authStore"
import { useScanStore } from "@/store/scanStore"
import { StatCard } from "@/components/shared/StatCard"
import { ScanLine, Award, Leaf, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductCard } from "@/components/shared/ProductCard"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts"

const mockActivityData = [
    { name: 'Mon', scans: 4 },
    { name: 'Tue', scans: 3 },
    { name: 'Wed', scans: 7 },
    { name: 'Thu', scans: 2 },
    { name: 'Fri', scans: 5 },
    { name: 'Sat', scans: 8 },
    { name: 'Sun', scans: 6 },
]

export default function DashboardPage() {
    const { user } = useAuthStore()
    const { recentScans } = useScanStore()

    const totalScans = recentScans.length
    const totalCarbon = recentScans.reduce((acc, scan) => acc + scan.carbonFootprint, 0)

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {user?.name || "Eco Warrior"}!</p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Scans"
                    value={totalScans || 124}
                    icon={ScanLine}
                    description="+12 from last week"
                />
                <StatCard
                    title="Points"
                    value={user?.points || 0}
                    icon={Zap}
                    description="Level 5"
                />
                <StatCard
                    title="Carbon Saved"
                    value={`${(totalCarbon * 1.5).toFixed(1)}kg`}
                    icon={Leaf}
                    description="~ 3 trees planted"
                />
                <StatCard
                    title="Badges"
                    value="4"
                    icon={Award}
                    description="Next: Master Recycler"
                />
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={mockActivityData}>
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
        </div>
    )
}
