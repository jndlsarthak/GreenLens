"use client"

import { useBadgeStore } from "@/store/badgeStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, Lock } from "lucide-react"
import { Badge as UiBadge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function BadgesPage() {
    const { badges } = useBadgeStore()

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Badges</h1>
                <p className="text-muted-foreground">Track your achievements and milestones.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {badges.map(badge => (
                    <Card key={badge.id} className={cn("text-center", !badge.earned && "opacity-60 bg-muted/40")}>
                        <CardHeader className="flex items-center justify-center pb-2">
                            <div className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center mb-2",
                                badge.earned ? "bg-yellow-100 text-yellow-600" : "bg-muted text-muted-foreground"
                            )}>
                                {badge.earned ? <Award className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
                            </div>
                            <CardTitle className="text-base">{badge.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground mb-3">{badge.description}</p>
                            {badge.earned ? (
                                <UiBadge variant="default" className="bg-yellow-500 hover:bg-yellow-600">Earned!</UiBadge>
                            ) : (
                                <UiBadge variant="outline">Locked</UiBadge>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
