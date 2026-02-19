import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
            login: (user, token) => set({ user, token, isAuthenticated: true }),
            logout: () => set({ user: null, token: null, isAuthenticated: false }),
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
