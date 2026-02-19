import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    description?: string
    trend?: 'up' | 'down' | 'neutral'
}

export function StatCard({ title, value, icon: Icon, description, trend }: StatCardProps) {
    return (
        <Card>
            <CardContent className="p-6 flex items-center justify-between space-x-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="text-2xl font-bold">{value}</h3>
                    {description && (
                        <p className="text-xs text-muted-foreground mt-1">{description}</p>
                    )}
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                    <Icon className="w-6 h-6 text-primary" />
                </div>
            </CardContent>
        </Card>
    )
}
