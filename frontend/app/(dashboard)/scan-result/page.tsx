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
import { productsApi } from "@/lib/api"
import { getCarbonComparisons, getEcoTip } from "@/lib/comparisons"
import { cn } from "@/lib/utils"

const fallbackProduct = {
    id: "fallback",
    barcode: "000",
    name: "Unknown Product",
    brand: "",
    image: "",
    ecoScore: "C" as const,
    carbonFootprint: 0,
    date: new Date().toISOString(),
    pointsEarned: 0
}

interface Alternative {
    id: string
    barcode: string
    name: string
    brand: string | null
    imageUrl: string | null
    carbonFootprint: number
    ecoScore: string
    carbonReduction: number
}

function ScanResultContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const barcode = searchParams.get("barcode")
    const { currentScan } = useScanStore()
    const { challenges } = useChallengeStore()
    const [showPoints, setShowPoints] = useState(false)
    const [product, setProduct] = useState(currentScan ?? fallbackProduct)
    const [loading, setLoading] = useState(!currentScan && !!barcode)
    const [alternatives, setAlternatives] = useState<Alternative[]>([])
    const [loadingAlternatives, setLoadingAlternatives] = useState(false)

    useEffect(() => {
        if (currentScan) {
            setProduct(currentScan)
            if (currentScan.barcode && currentScan.barcode !== "000") {
                setLoadingAlternatives(true)
                productsApi.alternatives(currentScan.barcode)
                    .then((res) => setAlternatives(res.alternatives))
                    .catch(() => setAlternatives([]))
                    .finally(() => setLoadingAlternatives(false))
            }
            return
        }
        if (!barcode) {
            setProduct({ ...fallbackProduct, barcode: "000" })
            return
        }
        let cancelled = false
        productsApi
            .lookup(barcode)
            .then((p) => {
                if (!cancelled) {
                    setProduct({
                        id: p.id,
                        barcode: p.barcode,
                        name: p.name,
                        brand: p.brand ?? "",
                        image: p.imageUrl ?? "",
                        ecoScore: (p.ecoScore ?? "C") as "A" | "B" | "C" | "D" | "F",
                        carbonFootprint: p.carbonFootprint,
                        date: new Date().toISOString(),
                        pointsEarned: 0
                    })
                    // Fetch alternatives if product has high carbon
                    if (["C", "D", "F"].includes(p.ecoScore)) {
                        setLoadingAlternatives(true)
                        productsApi.alternatives(p.barcode)
                            .then((res) => setAlternatives(res.alternatives))
                            .catch(() => setAlternatives([]))
                            .finally(() => setLoadingAlternatives(false))
                    }
                }
            })
            .catch(() => setProduct({ ...fallbackProduct, barcode }))
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [barcode, currentScan])

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
    const comparisons = getCarbonComparisons(product.carbonFootprint)
    const ecoTip = getEcoTip(product.ecoScore, product.carbonFootprint)

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <LoadingSpinner />
            </div>
        )
    }

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
                    <CardContent className="flex flex-col items-center gap-3">
                        <ImpactMeter value={product.carbonFootprint} max={10} />
                        <div className="space-y-1 text-sm text-center">
                            {comparisons.map((comp, i) => (
                                <p key={i} className="text-muted-foreground">
                                    {comp.icon} Equivalent to {comp.label.toLowerCase()} for{" "}
                                    <span className="font-bold text-foreground">{comp.value}</span>
                                </p>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <Card className={cn(
                        "border",
                        ecoTip.variant === "good" && "bg-eco-green/10 border-eco-green/20",
                        ecoTip.variant === "warning" && "bg-yellow-50 border-yellow-200",
                        ecoTip.variant === "info" && "bg-blue-50 border-blue-200"
                    )}>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className={cn(
                                "text-white p-2 rounded-full",
                                ecoTip.variant === "good" && "bg-eco-green",
                                ecoTip.variant === "warning" && "bg-yellow-500",
                                ecoTip.variant === "info" && "bg-blue-500"
                            )}>
                                <Leaf className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className={cn(
                                    "font-semibold",
                                    ecoTip.variant === "good" && "text-eco-green-900",
                                    ecoTip.variant === "warning" && "text-yellow-900",
                                    ecoTip.variant === "info" && "text-blue-900"
                                )}>Eco Tip</h4>
                                <p className={cn(
                                    "text-xs",
                                    ecoTip.variant === "good" && "text-eco-green-800",
                                    ecoTip.variant === "warning" && "text-yellow-800",
                                    ecoTip.variant === "info" && "text-blue-800"
                                )}>
                                    {ecoTip.message}
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
            {(alternatives.length > 0 || loadingAlternatives) && (
                <div className="space-y-3">
                    <h3 className="font-semibold">Better Alternatives</h3>
                    {loadingAlternatives ? (
                        <div className="flex justify-center py-4">
                            <LoadingSpinner />
                        </div>
                    ) : alternatives.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {alternatives.map((alt) => (
                                <Card
                                    key={alt.id}
                                    className="p-3 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => router.push(`/scan-result?barcode=${alt.barcode}`)}
                                >
                                    <div className="flex gap-3">
                                        <div className="relative w-12 h-12 bg-muted rounded shrink-0 overflow-hidden">
                                            {alt.imageUrl ? (
                                                <Image src={alt.imageUrl} alt={alt.name} fill className="object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-muted-foreground text-xs">No Image</div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-sm font-medium truncate">{alt.name}</h4>
                                            <p className="text-xs text-muted-foreground truncate">{alt.brand ?? "Unknown brand"}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <EcoScoreBadge score={alt.ecoScore as "A" | "B" | "C" | "D" | "F"} size="sm" />
                                                <p className="text-xs text-eco-green font-bold">
                                                    -{alt.carbonReduction}% CO₂
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No alternatives found in our database yet. Keep scanning to help us build better recommendations!</p>
                    )}
                </div>
            )}

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
