"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts"
import { cn } from "@/lib/utils"

interface ImpactMeterProps {
    value: number // Carbon footprint in kg CO2e
    max?: number
    size?: number
    className?: string
    label?: string
}

export function ImpactMeter({ value, max = 10, size = 120, className, label = "kg CO2e" }: ImpactMeterProps) {
    const percentage = Math.min((value / max) * 100, 100)

    // Color based on value relative to max (simulated "average")
    // Lower is better
    const getColor = (val: number) => {
        if (val < max * 0.3) return "#10b981" // Green
        if (val < max * 0.6) return "#facc15" // Yellow
        if (val < max * 0.8) return "#fb923c" // Orange
        return "#ef4444" // Red
    }

    const color = getColor(value)

    const data = [
        { name: "Value", value: value, color: color },
        { name: "Remaining", value: Math.max(0, max - value), color: "#e5e7eb" },
    ]

    return (
        <div className={cn("relative flex flex-col items-center justify-center", className)} style={{ width: size, height: size }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={size / 2 - 10}
                        outerRadius={size / 2}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        <Label
                            value={value.toFixed(1)}
                            position="center"
                            className="fill-foreground font-bold text-xl"
                            dy={-5}
                        />
                        <Label
                            value={label}
                            position="center"
                            className="fill-muted-foreground text-xs"
                            dy={15}
                        />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
