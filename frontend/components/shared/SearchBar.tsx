"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { productsApi } from "@/lib/api"
import { EcoScoreBadge } from "@/components/shared/EcoScoreBadge"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface SearchProduct {
    barcode: string
    name: string
    brand: string | null
    category: string | null
    imageUrl: string | null
    carbonFootprint: number
    ecoScore: string
}

export function SearchBar() {
    const router = useRouter()
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchProduct[]>([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return
        setLoading(true)
        setOpen(true)
        setResults([])
        try {
            const res = await productsApi.search(query.trim())
            setResults(res.products ?? [])
        } catch {
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    const handleSelect = (barcode: string) => {
        setOpen(false)
        setQuery("")
        setResults([])
        router.push(`/scan-result?barcode=${barcode}`)
    }

    return (
        <div ref={wrapperRef} className="relative w-full md:max-w-sm">
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search products..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => results.length > 0 && setOpen(true)}
                        className="w-full appearance-none bg-background pl-8 shadow-none"
                        autoComplete="off"
                    />
                </div>
            </form>

            {open && (loading || results.length > 0) && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-[70vh] overflow-auto rounded-lg border bg-background shadow-lg">
                    {loading ? (
                        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                            Searching Open Food Facts…
                        </div>
                    ) : results.length === 0 ? (
                        <div className="py-6 px-4 text-center text-sm text-muted-foreground">
                            No products found. Try another search.
                        </div>
                    ) : (
                        <ul className="py-1">
                            {results.map((p) => (
                                <li key={p.barcode}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(p.barcode)}
                                        className={cn(
                                            "flex w-full items-center gap-3 px-3 py-2.5 text-left",
                                            "hover:bg-muted/80 transition-colors"
                                        )}
                                    >
                                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
                                            {p.imageUrl ? (
                                                <Image
                                                    src={p.imageUrl}
                                                    alt=""
                                                    fill
                                                    className="object-cover"
                                                    sizes="48px"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                                    —
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{p.name}</p>
                                            {p.brand && (
                                                <p className="truncate text-xs text-muted-foreground">{p.brand}</p>
                                            )}
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-0.5">
                                            <EcoScoreBadge score={p.ecoScore as "A" | "B" | "C" | "D" | "F"} size="sm" />
                                            <span className="text-xs text-muted-foreground">
                                                {p.carbonFootprint} kg CO₂e
                                            </span>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    )
}
