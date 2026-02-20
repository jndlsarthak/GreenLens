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

export interface NewlyEarnedBadge {
    id: string
    name: string
}

interface ScanState {
    recentScans: ScanResult[]
    currentScan: ScanResult | null
    /** Ephemeral: badges just earned this scan (shown in popup, not persisted). */
    newlyEarnedBadges: NewlyEarnedBadge[] | null
    addScan: (scan: ScanResult) => void
    setCurrentScan: (scan: ScanResult | null) => void
    setNewlyEarnedBadges: (badges: NewlyEarnedBadge[] | null) => void
    clearScans: () => void
}

export const useScanStore = create<ScanState>()(
    persist(
        (set) => ({
            recentScans: [],
            currentScan: null,
            newlyEarnedBadges: null,
            addScan: (scan) =>
                set((state) => ({
                    recentScans: [scan, ...state.recentScans].slice(0, 50), // Keep last 50
                })),
            setCurrentScan: (scan) => set({ currentScan: scan }),
            setNewlyEarnedBadges: (badges) => set({ newlyEarnedBadges: badges }),
            clearScans: () => set({ recentScans: [], currentScan: null, newlyEarnedBadges: null }),
        }),
        {
            name: 'scan-storage',
            partialize: (state) => ({ recentScans: state.recentScans, currentScan: state.currentScan }),
        }
    )
)
