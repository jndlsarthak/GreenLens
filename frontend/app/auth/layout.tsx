import Link from "next/link"
import { Leaf } from "lucide-react"

const SDG_IMAGES = [
    { src: "/images/login/sdg-3.png", alt: "SDG 3 - Good Health and Well-being" },
    { src: "/images/login/sdg-11.png", alt: "SDG 11 - Sustainable Cities and Communities" },
    { src: "/images/login/sdg-12.png", alt: "SDG 12 - Responsible Consumption and Production" },
    { src: "/images/login/sdg-13.png", alt: "SDG 13 - Climate Action" },
]

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
                    GreenLens
                </div>
                <div className="relative z-20 flex flex-1 items-center justify-center pt-4 overflow-auto">
                    <div className="flex flex-row gap-3 justify-center items-center w-full max-w-[90%]">
                        {SDG_IMAGES.map(({ src, alt }) => (
                            <div key={src} className="flex-1 min-w-0 aspect-[3/4] flex items-center justify-center">
                                <img
                                    src={src}
                                    alt={alt}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        ))}
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
