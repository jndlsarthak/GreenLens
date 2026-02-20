import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useScanStore } from '@/store/scanStore'

interface User {
    id: string
    name: string
    email: string
    points: number
    level: number
    avatar?: string
    streakDays?: number
}

interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    login: (user: User, token: string) => void
    logout: () => void
    addPoints: (amount: number) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: (user, token) => {
                useScanStore.getState().clearScans()
                set({ user, token, isAuthenticated: true })
            },
            logout: () => {
                set({ user: null, token: null, isAuthenticated: false })
                useScanStore.getState().clearScans()
            },
            addPoints: (amount) =>
                set((state) => ({
                    user: state.user
                        ? { ...state.user, points: state.user.points + amount }
                        : null,
                })),
        }),
        {
            name: 'auth-storage',
        }
    )
)
