"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Zap } from "lucide-react"

interface PointsBadgeProps {
    points: number
    className?: string
    showLabel?: boolean
}

export function PointsBadge({ points, className, showLabel = true }: PointsBadgeProps) {
    return (
        <div className={cn("inline-flex items-center gap-1", className)}>
            <Badge variant="secondary" className="gap-1 px-2 py-1 text-eco-brown bg-eco-brown/10 hover:bg-eco-brown/20 border-eco-brown/20">
                <Zap className="w-3 h-3 fill-eco-brown" />
                <span className="font-bold">{points}</span>
                {showLabel && <span className="font-normal opacity-80">pts</span>}
            </Badge>
        </div>
    )
}

export function PointsAnimation({ amount }: { amount: number }) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute text-eco-green font-bold text-lg z-50 pointer-events-none flex items-center gap-1"
            >
                +{amount} pts
            </motion.div>
        </AnimatePresence>
    )
}
