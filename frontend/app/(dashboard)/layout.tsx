"use client"

import { useEffect } from "react"
import { Sidebar } from "@/components/shared/Sidebar"
import { BottomNav } from "@/components/shared/BottomNav"
import { Button } from "@/components/ui/button"
import { Menu, Search, CircleUser } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useUIStore } from "@/store/uiStore"
import { useAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const toggleSidebar = useUIStore(state => state.toggleSidebar)
    const { user, logout } = useAuthStore()
    const router = useRouter()

    useEffect(() => {
        if (user === null) {
            router.replace("/onboarding")
        }
    }, [user, router])

    const handleLogout = () => {
        logout()
        router.push("/auth/login")
    }

    return (
        <div className="grid min-h-screen w-full lg:grid-cols-[auto_1fr]">
            <Sidebar />
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
                        {/* Mobile Trigger handled by BottomNav mostly, but header menu is good too. 
                             Wait, ShadCN sidebar usually uses Sheet for mobile in header.
                             I'll leave it simple for now or implement Sheet menu.
                          */}
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation</span>
                    </Button>
                    <div className="w-full flex-1">
                        <form>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search products..."
                                    className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                                />
                            </div>
                        </form>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full">
                                <CircleUser className="h-5 w-5" />
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
                            <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="text-sm font-medium mr-2 hidden md:block">
                        {user?.points || 0} pts
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 mb-16 lg:mb-0">
                    {children}
                </main>
            </div>
            <BottomNav />
        </div>
    )
}
