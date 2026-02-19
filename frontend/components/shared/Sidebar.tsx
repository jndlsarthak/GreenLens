"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area" // Need to install scroll-area or use div
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
    LayoutDashboard,
    ScanLine,
    Trophy,
    Award,
    User,
    Settings,
    LogOut,
    Menu,
    Leaf
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useUIStore } from "@/store/uiStore"

const navItems = [
    { name: "Camera", href: "/", icon: ScanLine },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Challenges", href: "/challenges", icon: Trophy },
    { name: "Badges", href: "/badges", icon: Award },
    { name: "Profile", href: "/profile", icon: User },
]

export function Sidebar() {
    const pathname = usePathname()
    const isSidebarOpen = useUIStore(state => state.isSidebarOpen)

    return (
        <div className={cn("hidden border-r bg-muted/40 lg:block dark:bg-muted/10", isSidebarOpen ? "w-64" : "w-[70px]", "transition-all duration-300 h-screen sticky top-0")}>
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] justify-between">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Leaf className="h-6 w-6 text-eco-green" />
                        <span className={cn("transition-opacity", isSidebarOpen ? "opacity-100" : "opacity-0 hidden")}>EcoLearn</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-2"> {/* Replace ScrollArea with div for now */}
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                    pathname === item.href
                                        ? "bg-muted text-primary"
                                        : "text-muted-foreground",
                                    !isSidebarOpen && "justify-center"
                                )}
                                title={item.name}
                            >
                                <item.icon className="h-4 w-4" />
                                <span className={cn("transition-opacity", isSidebarOpen ? "opacity-100" : "opacity-0 hidden")}>{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="mt-auto p-4">
                    {/* User section or Logout */}
                </div>
            </div>
        </div>
    )
}
