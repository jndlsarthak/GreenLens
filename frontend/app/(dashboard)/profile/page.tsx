"use client"

import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
    const { user } = useAuthStore()

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="w-20 h-20">
                            <AvatarImage src={user?.avatar} />
                            <AvatarFallback className="text-lg">
                                {user?.name?.substring(0, 2).toUpperCase() || "EC"}
                            </AvatarFallback>
                        </Avatar>
                        <Button variant="outline">Change Avatar</Button>
                    </div>
                    <div className="space-y-2">
                        <Label>Display Name</Label>
                        <Input defaultValue={user?.name} />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input defaultValue={user?.email} disabled />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button>Save Changes</Button>
                </CardFooter>
            </Card>

            <Card className="border-red-200 dark:border-red-900">
                <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    <CardDescription>Irreversible account actions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Deleting your account will remove all your data, including points and badges.
                    </p>
                </CardContent>
                <CardFooter>
                    <Button variant="destructive">Delete Account</Button>
                </CardFooter>
            </Card>
        </div>
    )
}
