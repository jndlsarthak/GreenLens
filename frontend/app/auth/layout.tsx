"use client"

import Link from "next/link"
import { Leaf } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

const SDG_DATA = [
    {
        id: 3,
        title: "Good Health and Well-being",
        desc: "Ensure healthy lives and promote well-being for all at all ages.",
        color: "#4C9F38",
        src: "/images/login/sdg-3.png",
    },
    {
        id: 11,
        title: "Sustainable Cities and Communities",
        desc: "Make cities and human settlements inclusive, safe, resilient and sustainable.",
        color: "#FD9D24",
        src: "/images/login/sdg-11.png",
    },
    {
        id: 12,
        title: "Responsible Consumption and Production",
        desc: "Ensure sustainable consumption and production patterns.",
        color: "#BF8B2E",
        src: "/images/login/sdg-12.png",
    },
    {
        id: 13,
        title: "Climate Action",
        desc: "Take urgent action to combat climate change and its impacts.",
        color: "#3F7E44",
        src: "/images/login/sdg-13.png",
    },
]

function SDGDisplay() {
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % SDG_DATA.length)
        }, 2500) // Auto-rotate every 2.5 seconds for better UX
        return () => clearInterval(timer)
    }, [])

    const getPosition = (index: number) => {
        const diff = (index - currentIndex + SDG_DATA.length) % SDG_DATA.length

        if (diff === 0) return "center"
        if (diff === 1) return "right"
        if (diff === SDG_DATA.length - 1) return "left"
        return "hidden"
    }

    return (
        <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="popLayout">
                {SDG_DATA.map((sdg, index) => {
                    const position = getPosition(index)

                    let x = "0%"
                    let scale = 1
                    let opacity = 1
                    let zIndex = 1

                    if (position === "left") {
                        x = "-75%"
                        scale = 0.85
                        opacity = 0.5
                        zIndex = 5
                    } else if (position === "right") {
                        x = "75%"
                        scale = 0.85
                        opacity = 0.5
                        zIndex = 5
                    } else if (position === "hidden") {
                        // "Back" of the stack - tucks behind center
                        x = "0%"
                        scale = 0.5
                        opacity = 0
                        zIndex = 0
                    } else {
                        // Center
                        zIndex = 10
                    }

                    return (
                        <motion.div
                            key={sdg.id}
                            initial={false}
                            animate={{
                                x,
                                scale,
                                opacity,
                                zIndex,
                            }}
                            transition={{
                                duration: 1.2, // Smooth transition
                                ease: [0.25, 0.1, 0.25, 1], // Cubic bezier for silky smooth movement
                            }}
                            className="absolute w-[240px] h-[320px] rounded-2xl overflow-hidden shadow-2xl bg-white"
                        >
                            <img
                                src={sdg.src}
                                alt={`SDG ${sdg.id}`}
                                className="w-full h-full object-cover"
                                style={{
                                    objectPosition: "left bottom", // Forces the bottom-left (SDG number) to be visible
                                }}
                            />
                            {/* Subtle gradient for depth */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-eco-green" />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <Link href="/" className="flex items-center gap-2">
                        <Leaf className="h-6 w-6" />
                        GreenLens
                    </Link>
                </div>

                {/* Centered SDG Display in Green Space */}
                <div className="relative z-20 flex flex-1 flex-col items-center justify-center w-full">
                    <div className="w-full max-w-2xl">
                        <SDGDisplay />
                    </div>
                </div>

                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;The greatest threat to our planet is the belief that someone else will save it.&rdquo;
                        </p>
                        <footer className="text-sm">Robert Swan</footer>
                    </blockquote>
                </div>
            </div>
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    {children}
                </div>
            </div>
        </div>
    )
}
