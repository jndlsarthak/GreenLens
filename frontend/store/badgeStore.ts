import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Badge {
    id: string
    name: string
    description: string
    icon: string
    earned: boolean
    dateEarned?: string
}

interface BadgeState {
    badges: Badge[]
    earnBadge: (id: string) => void
}

const initialBadges: Badge[] = [
    {
        id: '1',
        name: 'Eco Starter',
        description: 'Scan your first product.',
        icon: 'Leaf',
        earned: false
    },
    {
        id: '2',
        name: 'Green Shopper',
        description: 'Scan 10 eco-friendly products (Score A or B).',
        icon: 'ShoppingBag',
        earned: false
    }
]

export const useBadgeStore = create<BadgeState>()(
    persist(
        (set) => ({
            badges: initialBadges,
            earnBadge: (id) => set((state) => ({
                badges: state.badges.map(b =>
                    b.id === id && !b.earned ? { ...b, earned: true, dateEarned: new Date().toISOString() } : b
                )
            }))
        }),
        {
            name: 'badge-storage',
        }
    )
)
