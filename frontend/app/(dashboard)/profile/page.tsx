"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { userApi } from "@/lib/api"
import {
    User,
    Bell,
    Settings,
    Shield,
    Info,
    AlertTriangle,
    ChevronDown,
    ChevronRight,
    Leaf,
    Pencil,
    Mail,
    ExternalLink,
} from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Section = "account" | "notifications" | "preferences" | "privacy" | "about" | "danger" | null

const APP_VERSION = "1.0.0"
const DROPDOWN_CONTENT_HEIGHT = 280

function ecoLevelFromPoints(points: number): string {
    if (points >= 500) return "Eco Champion"
    if (points >= 200) return "Eco Expert"
    if (points >= 100) return "Eco Enthusiast"
    if (points >= 25) return "Eco Explorer"
    return "Eco Starter"
}

export default function ProfilePage() {
    const router = useRouter()
    const { user, token, logout } = useAuthStore()
    const { theme, setTheme } = useTheme()
    const [section, setSection] = useState<Section>(null)
    const [profile, setProfile] = useState<{
        name: string | null
        email: string
        level: number
        totalPoints: number
        createdAt: string
    } | null>(null)
    const [loading, setLoading] = useState(true)
    const [editName, setEditName] = useState("")
    const [saving, setSaving] = useState(false)
    const [pushNotifications, setPushNotifications] = useState(false)
    const [carbonUnits, setCarbonUnits] = useState<"kg" | "lb">("kg")
    const [deleteConfirm, setDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        if (!token) return
        userApi(token)
            .profile()
            .then((data) => {
                setProfile({
                    name: data.name ?? null,
                    email: data.email,
                    level: data.level,
                    totalPoints: data.totalPoints,
                    createdAt: data.createdAt ?? new Date().toISOString(),
                })
                setEditName(data.name ?? "")
            })
            .catch(() => toast.error("Could not load profile"))
            .finally(() => setLoading(false))
    }, [token])

    const memberSince = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : "—"

    const handleSaveName = async () => {
        if (!token) return
        setSaving(true)
        try {
            const data = await userApi(token).updateProfile({ name: editName || undefined })
            setProfile((p) => (p ? { ...p, name: data.name ?? null } : null))
            useAuthStore.setState((s) => ({
                user: s.user ? { ...s.user, name: data.name ?? s.user.name } : null,
            }))
            toast.success("Display name updated")
        } catch {
            toast.error("Failed to update name")
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (!token) return
        setDeleting(true)
        try {
            await userApi(token).deleteAccount()
            logout()
            toast.success("Account deleted")
            router.replace("/auth/login")
        } catch {
            toast.error("Failed to delete account")
            setDeleting(false)
        }
    }

    const toggleSection = (s: Section) => {
        setSection((prev) => (prev === s ? null : s))
        if (s === "danger") setDeleteConfirm(false)
    }

    if (loading || !user) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        )
    }

    const rows: { id: Section; icon: React.ElementType; label: string; danger?: boolean }[] = [
        { id: "account", icon: User, label: "Account" },
        { id: "notifications", icon: Bell, label: "Notifications" },
        { id: "preferences", icon: Settings, label: "Preferences" },
        { id: "privacy", icon: Shield, label: "Privacy & Security" },
        { id: "about", icon: Info, label: "About" },
        { id: "danger", icon: AlertTriangle, label: "Danger Zone", danger: true },
    ]

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-12 px-1">
            {/* Top: profile summary */}
            <div className="flex flex-col items-center gap-4 pt-2 text-center">
                <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-primary/10 text-lg text-primary">
                        {(profile?.name || user.email).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">
                        {profile?.name || "No display name"}
                    </h1>
                    <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        {profile?.email}
                    </p>
                </div>
                <Badge variant="secondary" className="gap-1.5 bg-primary/10 text-primary">
                    <Leaf className="h-3.5 w-3.5" />
                    {ecoLevelFromPoints(profile?.totalPoints ?? 0)}
                </Badge>
                <p className="text-xs text-muted-foreground">Member since {memberSince}</p>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => toggleSection("account")}
                >
                    <Pencil className="h-4 w-4" />
                    Edit profile
                </Button>
            </div>

            {/* Card: each row has its own dropdown below it */}
            <Card className="w-full min-w-0 overflow-hidden sm:min-w-[420px]">
                <CardContent className="p-0">
                    {rows.map(({ id, icon: Icon, label, danger }) => {
                        const isOpen = section === id
                        return (
                            <div key={id} className="border-b last:border-b-0">
                                <button
                                    type="button"
                                    onClick={() => toggleSection(id)}
                                    className={cn(
                                        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                                        danger ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" : "hover:bg-muted/60"
                                    )}
                                >
                                    <Icon className={cn("h-5 w-5 shrink-0", danger ? "text-red-600" : "text-muted-foreground")} />
                                    <span className="flex-1 font-medium">{label}</span>
                                    {isOpen ? (
                                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    )}
                                </button>
                                {isOpen && (
                                    <div
                                        className="border-t bg-muted/30 overflow-y-auto px-4 py-4"
                                        style={{ height: DROPDOWN_CONTENT_HEIGHT, minHeight: DROPDOWN_CONTENT_HEIGHT }}
                                    >
                                        {id === "account" && (
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label className="text-sm">Display name</Label>
                                                    <div className="flex gap-2">
                                                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Your name" className="h-9" />
                                                        <Button onClick={handleSaveName} disabled={saving} size="sm">{saving ? "Saving…" : "Save"}</Button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm">Email</Label>
                                                    <Input value={profile?.email ?? ""} disabled className="h-9 bg-muted" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm">Password</Label>
                                                    <Button variant="outline" size="sm" disabled>Change password (coming soon)</Button>
                                                </div>
                                                <p className="text-xs text-muted-foreground">No connected accounts.</p>
                                            </div>
                                        )}
                                        {id === "notifications" && (
                                            <div className="flex items-center justify-between rounded-lg border bg-background p-4">
                                                <div>
                                                    <p className="font-medium text-sm">Push notifications</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">Reminders to scan and eco progress updates.</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    role="switch"
                                                    aria-checked={pushNotifications}
                                                    onClick={() => setPushNotifications((v) => !v)}
                                                    className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", pushNotifications ? "bg-primary" : "bg-muted")}
                                                >
                                                    <span className={cn("absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", pushNotifications && "translate-x-5")} />
                                                </button>
                                            </div>
                                        )}
                                        {id === "preferences" && (
                                            <div className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-sm">Language</Label>
                                                    <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" defaultValue="en">
                                                        <option value="en">English</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-sm">Theme</Label>
                                                    <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={theme ?? "system"} onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}>
                                                        <option value="light">Light</option>
                                                        <option value="dark">Dark</option>
                                                        <option value="system">System</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-sm">Carbon measurement</Label>
                                                    <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={carbonUnits} onChange={(e) => setCarbonUnits(e.target.value as "kg" | "lb")}>
                                                        <option value="kg">kg CO₂e</option>
                                                        <option value="lb">lb CO₂e</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                        {id === "privacy" && (
                                            <div className="space-y-2">
                                                <Button variant="outline" size="sm" className="w-full justify-start gap-2" disabled>
                                                    Download my data <Badge variant="secondary" className="ml-auto text-xs">Coming soon</Badge>
                                                </Button>
                                                <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => window.open("/privacy", "_blank")}>
                                                    Privacy Policy <ExternalLink className="ml-auto h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => window.open("/terms", "_blank")}>
                                                    Terms of Service <ExternalLink className="ml-auto h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                        {id === "about" && (
                                            <div className="space-y-3">
                                                <p className="text-sm text-muted-foreground">Version <strong>{APP_VERSION}</strong></p>
                                                <p className="text-xs text-muted-foreground">
                                                    Carbon footprints and eco scores use Open Food Facts data and global research on production, packaging, and transport. When detailed data is available we use it; otherwise we estimate from category and ingredients.
                                                </p>
                                                <Button variant="outline" size="sm" disabled>Contact support (coming soon)</Button>
                                            </div>
                                        )}
                                        {id === "danger" && (
                                            <div className="space-y-3">
                                                {!deleteConfirm ? (
                                                    <Button variant="destructive" size="sm" onClick={() => setDeleteConfirm(true)}>Delete account</Button>
                                                ) : (
                                                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30">
                                                        <p className="text-sm font-medium text-red-800 dark:text-red-200">Are you sure? This cannot be undone.</p>
                                                        <div className="mt-2 flex gap-2">
                                                            <Button variant="destructive" size="sm" onClick={handleDeleteAccount} disabled={deleting}>{deleting ? "Deleting…" : "Yes, delete"}</Button>
                                                            <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(false)} disabled={deleting}>Cancel</Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        </div>
    )
}
