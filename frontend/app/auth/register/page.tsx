"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuthStore } from "@/store/authStore"
import { cn } from "@/lib/utils"
import { authApi } from "@/lib/api"
import { toast } from "sonner"

// Password strength utils
const checkStrength = (pass: string) => {
    let score = 0
    if (!pass) return 0
    if (pass.length > 6) score++
    if (pass.length > 10) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++
    return score
}

const formSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
    terms: z.boolean().refine(val => val === true, {
        message: "You must accept the terms and conditions"
    })
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

export default function RegisterPage() {
    const router = useRouter()
    const login = useAuthStore((state) => state.login)
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            terms: false
        },
    })

    const password = form.watch("password")
    const strength = checkStrength(password)

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            await authApi.register({
                email: values.email,
                password: values.password,
                name: values.name,
            })
            const res = await authApi.login({ email: values.email, password: values.password })
            login(
                {
                    id: res.user.id,
                    name: res.user.name ?? values.name,
                    email: res.user.email,
                    points: res.user.points,
                    level: res.user.level,
                    streakDays: res.user.streakDays,
                },
                res.token
            )
            router.push("/")
        } catch (err) {
            const code = err && typeof err === "object" && "code" in err ? (err as { code?: string }).code : undefined
            const message = err instanceof Error ? err.message : "Registration failed"
            if (code === "CONFLICT" || message.toLowerCase().includes("already exists")) {
                toast.error("An account with this email already exists. Please log in.")
                router.push("/auth/login")
            } else {
                toast.error(message)
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Create an account
                </h1>
                <p className="text-sm text-muted-foreground">
                    Enter your email below to create your account
                </p>
            </div>
            <div className="grid gap-6">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                type="text"
                                autoCapitalize="words"
                                autoComplete="name"
                                autoCorrect="off"
                                disabled={isLoading}
                                {...form.register("name")}
                            />
                            {form.formState.errors.name && (
                                <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                placeholder="name@example.com"
                                type="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                                disabled={isLoading}
                                {...form.register("email")}
                            />
                            {form.formState.errors.email && (
                                <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                disabled={isLoading}
                                {...form.register("password")}
                            />
                            {/* Strength Indicator */}
                            {password && (
                                <div className="flex gap-1 h-1 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "h-full w-full rounded-full transition-colors",
                                                i < strength
                                                    ? (strength < 3 ? "bg-red-500" : strength < 4 ? "bg-yellow-500" : "bg-green-500")
                                                    : "bg-muted"
                                            )}
                                        />
                                    ))}
                                </div>
                            )}
                            {form.formState.errors.password && (
                                <p className="text-xs text-red-500">{form.formState.errors.password.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                disabled={isLoading}
                                {...form.register("confirmPassword")}
                            />
                            {form.formState.errors.confirmPassword && (
                                <p className="text-xs text-red-500">{form.formState.errors.confirmPassword.message}</p>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Controller
                                control={form.control}
                                name="terms"
                                render={({ field }) => (
                                    <Checkbox
                                        id="terms"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                            <Label htmlFor="terms" className="text-sm font-normal">
                                I agree to the{" "}
                                <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link>
                                {" "}and{" "}
                                <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>
                            </Label>
                        </div>
                        {form.formState.errors.terms && (
                            <p className="text-xs text-red-500">{form.formState.errors.terms.message}</p>
                        )}

                        <Button disabled={isLoading}>
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Create Account
                        </Button>
                    </div>
                </form>
                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                        href="/auth/login"
                        className="underline underline-offset-4 hover:text-primary"
                    >
                        Sign in
                    </Link>
                </div>
            </div>
        </>
    )
}
