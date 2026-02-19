import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EcoScoreBadge } from "./EcoScoreBadge"
import Image from "next/image"
import { ScanResult } from "@/store/scanStore"

interface ProductCardProps {
    product: ScanResult
    onClick?: () => void
}

export function ProductCard({ product, onClick }: ProductCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
            <div className="relative aspect-square w-full bg-muted">
                {product.image ? (
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                        No Image
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <EcoScoreBadge score={product.ecoScore} size="sm" />
                </div>
            </div>
            <div className="p-4">
                <h4 className="font-semibold text-sm line-clamp-1">{product.name}</h4>
                <p className="text-xs text-muted-foreground">{product.brand}</p>
                <p className="text-xs mt-2 font-medium">{product.carbonFootprint} kg CO2e</p>
            </div>
        </Card>
    )
}
