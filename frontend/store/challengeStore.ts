import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Challenge {
    id: string
    title: string
    description: string
    category: 'Food' | 'Energy' | 'Waste' | 'Transport'
    points: number
    target: number
    progress: number
    status: 'active' | 'completed' | 'available'
}

interface ChallengeState {
    challenges: Challenge[]
    acceptChallenge: (id: string) => void
    updateProgress: (id: string, amount: number) => void
    completeChallenge: (id: string) => void
}

const initialChallenges: Challenge[] = [
    {
        id: '1',
        title: 'Plant-Based Week',
        description: 'Eat only plant-based meals for a week.',
        category: 'Food',
        points: 500,
        target: 7,
        progress: 0,
        status: 'available'
    },
    {
        id: '2',
        title: 'Zero Waste Shopping',
        description: 'Shop with reusable bags 5 times.',
        category: 'Waste',
        points: 200,
        target: 5,
        progress: 0,
        status: 'available'
    }
]

export const useChallengeStore = create<ChallengeState>()(
    persist(
        (set) => ({
            challenges: initialChallenges,
            acceptChallenge: (id) => set((state) => ({
                challenges: state.challenges.map(c =>
                    c.id === id ? { ...c, status: 'active' } : c
                )
            })),
            updateProgress: (id, amount) => set((state) => ({
                challenges: state.challenges.map(c =>
                    c.id === id ? { ...c, progress: Math.min(c.progress + amount, c.target) } : c
                )
            })),
            completeChallenge: (id) => set((state) => ({
                challenges: state.challenges.map(c =>
                    c.id === id ? { ...c, status: 'completed' } : c
                )
            }))
        }),
        {
            name: 'challenge-storage',
        }
    )
)
