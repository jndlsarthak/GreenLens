"use client"

import { useScanStore } from "@/store/scanStore"
import { Card, CardContent } from "@/components/ui/card"
import { EcoScoreBadge } from "@/components/shared/EcoScoreBadge"
import Image from "next/image"

export default function HistoryPage() {
    const { recentScans } = useScanStore()

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Scan History</h1>
                <p className="text-muted-foreground">View all your past product scans.</p>
            </div>

            <div className="space-y-4">
                {recentScans.length > 0 ? (
                    recentScans.map((scan, i) => (
                        <Card key={i} className="overflow-hidden">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="h-16 w-16 relative bg-muted rounded shrink-0 overflow-hidden">
                                    {scan.image ? (
                                        <Image src={scan.image} alt={scan.name} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Img</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold truncate">{scan.name}</h3>
                                            <p className="text-sm text-muted-foreground">{scan.brand}</p>
                                        </div>
                                        <EcoScoreBadge score={scan.ecoScore} />
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                                        <span>{new Date(scan.date).toLocaleDateString()}</span>
                                        <span>+{scan.pointsEarned} pts</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-10 text-muted-foreground">
                        No scan history found.
                    </div>
                )}
            </div>
        </div>
    )
}
