import Link from "next/link"
import { Leaf } from "lucide-react"

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
                    <Leaf className="mr-2 h-6 w-6" />
                    EcoLearn
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
