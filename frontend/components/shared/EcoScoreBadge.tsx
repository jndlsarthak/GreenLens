import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface EcoScoreBadgeProps {
    score: 'A' | 'B' | 'C' | 'D' | 'F'
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function EcoScoreBadge({ score, size = 'md', className }: EcoScoreBadgeProps) {
    const colors = {
        A: "bg-eco-green hover:bg-eco-green/90 text-white border-eco-green",
        B: "bg-eco-lightGreen hover:bg-eco-lightGreen/90 text-eco-green-900 border-eco-lightGreen",
        C: "bg-eco-yellow hover:bg-eco-yellow/90 text-yellow-900 border-eco-yellow",
        D: "bg-eco-orange hover:bg-eco-orange/90 text-orange-900 border-eco-orange",
        F: "bg-eco-red hover:bg-eco-red/90 text-white border-eco-red",
    }

    const sizes = {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-2.5 py-0.5",
        lg: "text-base px-3 py-1",
    }

    return (
        <Badge className={cn(colors[score], sizes[size], "font-bold shadow-sm", className)}>
            Score {score}
        </Badge>
    )
}
