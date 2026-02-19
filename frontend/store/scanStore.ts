import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Product {
    name: string
    brand: string
    image: string
    ecoScore: 'A' | 'B' | 'C' | 'D' | 'F'
    carbonFootprint: number // kg CO2e
}

export interface ScanResult extends Product {
    id: string
    barcode: string
    date: string
    pointsEarned: number
}

interface ScanState {
    recentScans: ScanResult[]
    currentScan: ScanResult | null
    addScan: (scan: ScanResult) => void
    setCurrentScan: (scan: ScanResult | null) => void
}

export const useScanStore = create<ScanState>()(
    persist(
        (set) => ({
            recentScans: [],
            currentScan: null,
            addScan: (scan) =>
                set((state) => ({
                    recentScans: [scan, ...state.recentScans].slice(0, 50), // Keep last 50
                })),
            setCurrentScan: (scan) => set({ currentScan: scan }),
        }),
        {
            name: 'scan-storage',
        }
    )
)
