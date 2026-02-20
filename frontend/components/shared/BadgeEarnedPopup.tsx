"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Award, X } from "lucide-react"
import type { NewlyEarnedBadge } from "@/store/scanStore"

interface BadgeEarnedPopupProps {
    badges: NewlyEarnedBadge[]
    onDismiss: () => void
}

const BIG_DURATION_MS = 1500
const AUTO_DISMISS_MS = 3000

export function BadgeEarnedPopup({ badges, onDismiss }: BadgeEarnedPopupProps) {
    const [phase, setPhase] = useState<"big" | "small">("big")

    useEffect(() => {
        const toSmall = setTimeout(() => setPhase("small"), BIG_DURATION_MS)
        const dismiss = setTimeout(() => onDismiss(), AUTO_DISMISS_MS)
        return () => {
            clearTimeout(toSmall)
            clearTimeout(dismiss)
        }
    }, [onDismiss])

    if (badges.length === 0) return null

    const label = badges.length === 1
        ? badges[0].name
        : `${badges.length} badges: ${badges.map((b) => b.name).join(", ")}`

    return (
        <>
            <AnimatePresence mode="wait">
                {phase === "big" && (
                    <motion.div
                        key="big"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    >
                        <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-amber-100 to-amber-200/95 shadow-2xl border-2 border-amber-400/50 p-8 text-center max-w-sm">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-400/90 shadow-lg mb-4">
                                <Award className="h-14 w-14 text-amber-900" />
                            </div>
                            <p className="text-lg font-bold text-amber-900">Badge earned!</p>
                            <p className="text-base text-amber-800 mt-1">{label}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {phase === "small" && (
                    <motion.div
                        key="small"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.88 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                        className="fixed bottom-6 right-6 z-[100] w-[220px] rounded-xl bg-gradient-to-b from-amber-100 to-amber-200/95 shadow-xl border-2 border-amber-400/50 p-3 text-center"
                    >
                        <button
                            type="button"
                            onClick={onDismiss}
                            className="absolute -top-1.5 -right-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                            aria-label="Dismiss"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                        <div className="flex flex-col items-center gap-1.5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400/90">
                                <Award className="h-6 w-6 text-amber-900" />
                            </div>
                            <p className="text-xs font-semibold text-amber-900">Badge earned</p>
                            <p className="text-[10px] text-amber-800 line-clamp-2">{label}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
