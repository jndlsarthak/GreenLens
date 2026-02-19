"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    ScanLine,
    Trophy,
    Award,
    User
} from "lucide-react"

const navItems = [
    { name: "Camera", href: "/", icon: ScanLine },
    { name: "Stats", href: "/dashboard", icon: LayoutDashboard },
    { name: "Challenges", href: "/challenges", icon: Trophy },
    { name: "Badges", href: "/badges", icon: Award },
    { name: "Profile", href: "/profile", icon: User },
]

export function BottomNav() {
    const pathname = usePathname()

    return (
        <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t lg:hidden">
            <div className="grid h-full grid-cols-5 mx-auto">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "inline-flex flex-col items-center justify-center px-5 hover:bg-muted/50 group",
                            pathname === item.href && "text-primary"
                        )}
                    >
                        <item.icon className={cn("w-6 h-6 mb-1 text-muted-foreground group-hover:text-primary transition-colors", pathname === item.href && "text-primary")} />
                        <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">{item.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    )
}
