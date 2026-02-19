"use client"

import { useRouter } from "next/navigation"
import { CameraView } from "@/components/shared/CameraView"
import { ProductCard } from "@/components/shared/ProductCard"
import { useScanStore } from "@/store/scanStore"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { ChevronRight, ArrowRight } from "lucide-react"

export default function HomePage() {
    const router = useRouter()
    const { addPoints } = useAuthStore()
    const { recentScans, addScan, setCurrentScan } = useScanStore()

    const handleScan = (barcode: string) => {
        // Mock finding a product
        const mockProduct = {
            id: Math.random().toString(36).substring(7),
            barcode: barcode,
            name: "Organic Almond Milk",
            brand: "Nature's Promise",
            image: "", // Use generic or leave empty
            ecoScore: "B" as const,
            carbonFootprint: 0.8,
            date: new Date().toISOString(),
            pointsEarned: 10
        }

        // Add to store
        addScan(mockProduct)
        setCurrentScan(mockProduct)
        addPoints(10)

        // Navigate to results
        router.push(`/scan-result?barcode=${barcode}`)
    }

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-8rem)] lg:h-auto">
            {/* Camera Section - Grows to fill available space on mobile */}
            <div className="flex-1 min-h-[300px] lg:min-h-[500px] relative rounded-xl overflow-hidden shadow-lg border-2 border-muted/20">
                <CameraView onScan={handleScan} />
            </div>

            {/* Recent Scans Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-lg font-semibold tracking-tight">Recent Scans</h2>
                    <Button variant="ghost" size="sm" className="text-sm text-primary hover:text-primary/80" onClick={() => router.push('/history')}>
                        View All <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                </div>

                {recentScans.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4">
                        {recentScans.slice(0, 4).map((scan, idx) => (
                            <ProductCard
                                key={idx}
                                product={scan}
                                onClick={() => {
                                    setCurrentScan(scan)
                                    router.push(`/scan-result?barcode=${scan.barcode}`)
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/20 text-center">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium">No scans yet</h3>
                        <p className="text-sm text-muted-foreground mt-1">Scan your first product to see its impact!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
