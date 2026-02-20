"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, Lock } from "lucide-react"
import { Badge as UiBadge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { badgesApi } from "@/lib/api"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"

interface BadgeItem {
    id: string
    name: string
    description: string
    earned: boolean
    earnedAt?: string | null
}

export default function BadgesPage() {
    const { token } = useAuthStore()
    const [badges, setBadges] = useState<BadgeItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        if (token) {
            badgesApi(token)
                .userBadges()
                .then((res) => {
                    if (!cancelled)
                        setBadges(
                            res.badges.map((b) => ({
                                id: b.id,
                                name: b.name,
                                description: b.description,
                                earned: b.earned,
                                earnedAt: b.earnedAt ?? undefined,
                            }))
                        )
                })
                .catch(() => {
                    if (!cancelled) setBadges([])
                })
                .finally(() => {
                    if (!cancelled) setLoading(false)
                })
        } else {
            badgesApi(null)
                .all()
                .then((list) => {
                    if (!cancelled)
                        setBadges(
                            list.map((b) => ({
                                id: b.id,
                                name: b.name,
                                description: b.description,
                                earned: false,
                            }))
                        )
                })
                .catch(() => {
                    if (!cancelled) setBadges([])
                })
                .finally(() => {
                    if (!cancelled) setLoading(false)
                })
        }
        return () => {
            cancelled = true
        }
    }, [token])

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Badges</h1>
                <p className="text-muted-foreground">Track your achievements and milestones.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner />
                </div>
            ) : badges.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    No badges found. Run the backend seed to add badges: <code className="text-sm bg-muted px-1 rounded">npx prisma db seed</code>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {badges.map((badge) => (
                        <Card key={badge.id} className={cn("text-center", !badge.earned && "opacity-60 bg-muted/40")}>
                            <CardHeader className="flex items-center justify-center pb-2">
                                <div
                                    className={cn(
                                        "w-16 h-16 rounded-full flex items-center justify-center mb-2",
                                        badge.earned ? "bg-yellow-100 text-yellow-600" : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {badge.earned ? <Award className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
                                </div>
                                <CardTitle className="text-base">{badge.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground mb-3">{badge.description}</p>
                                {badge.earned ? (
                                    <UiBadge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
                                        Earned!
                                    </UiBadge>
                                ) : (
                                    <UiBadge variant="outline">Locked</UiBadge>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
