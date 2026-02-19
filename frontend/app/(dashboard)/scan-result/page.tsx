"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useScanStore } from "@/store/scanStore"
import { useChallengeStore } from "@/store/challengeStore"
import { ImpactMeter } from "@/components/shared/ImpactMeter"
import { EcoScoreBadge } from "@/components/shared/EcoScoreBadge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Share2, Save, Leaf } from "lucide-react"
import confetti from "canvas-confetti"
import { PointsAnimation } from "@/components/shared/PointsBadge"
import { ChallengeCard } from "@/components/shared/ChallengeCard"
import Image from "next/image"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"

function ScanResultContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const barcode = searchParams.get('barcode')
    const { currentScan, addScan } = useScanStore()
    const { challenges } = useChallengeStore()
    const [showPoints, setShowPoints] = useState(false)

    // Fallback if currentScan is lost or direct access
    // Ideally fetch from API by barcode
    const product = currentScan || {
        id: "mock",
        barcode: barcode || "000",
        name: "Unknown Product",
        brand: "Brand",
        image: "",
        ecoScore: "C" as const,
        carbonFootprint: 2.5,
        date: new Date().toISOString(),
        pointsEarned: 0
    }

    useEffect(() => {
        if (product.pointsEarned > 0) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            })
            setShowPoints(true)
            setTimeout(() => setShowPoints(false), 3000)
        }
    }, [product.pointsEarned])

    const suggestedChallenge = challenges.find(c => c.status === 'available')

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full relative">
            {showPoints && <PointsAnimation amount={product.pointsEarned} />}

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-semibold">Scan Result</h1>
            </div>

            {/* Product Header */}
            <div className="flex gap-4 items-start">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted border">
                    {product.image ? (
                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-xs">No Image</div>
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-lg font-bold">{product.name}</h2>
                            <p className="text-sm text-muted-foreground">{product.brand}</p>
                        </div>
                        <EcoScoreBadge score={product.ecoScore} size="lg" />
                    </div>
                </div>
            </div>

            {/* Impact Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Carbon Footprint</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <ImpactMeter value={product.carbonFootprint} max={10} />
                        <p className="text-sm text-center mt-2 text-muted-foreground">
                            Equivalent to driving <span className="font-bold text-foreground">{(product.carbonFootprint * 2.5).toFixed(1)} miles</span>
                        </p>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <Card className="bg-eco-green/10 border-eco-green/20">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="bg-eco-green text-white p-2 rounded-full">
                                <Leaf className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-eco-green-900">Eco Tip</h4>
                                <p className="text-xs text-eco-green-800">
                                    This product has a low carbon footprint! Great choice.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {suggestedChallenge && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold">New Challenge Available</h3>
                            <ChallengeCard challenge={suggestedChallenge} />
                        </div>
                    )}
                </div>
            </div>

            {/* Better Alternatives */}
            <div className="space-y-3">
                <h3 className="font-semibold">Better Alternatives</h3>
                <div className="grid grid-cols-2 gap-4">
                    {/* Mock Alternatives */}
                    {[1, 2].map((i) => (
                        <Card key={i} className="p-3">
                            <div className="flex gap-3">
                                <div className="w-12 h-12 bg-muted rounded shrink-0"></div>
                                <div className="min-w-0">
                                    <h4 className="text-sm font-medium truncate">Eco Alternative {i}</h4>
                                    <p className="text-xs text-muted-foreground">Brand {i}</p>
                                    <p className="text-xs text-eco-green font-bold mt-1">-30% CO2</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4 mt-4">
                <Button variant="outline" className="w-full">
                    <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
                <Button className="w-full" onClick={() => router.push('/')}>
                    Scan Another
                </Button>
            </div>
        </div>
    )
}

export default function ScanResultPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><LoadingSpinner /></div>}>
            <ScanResultContent />
        </Suspense>
    )
}
