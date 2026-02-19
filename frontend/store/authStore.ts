import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
    id: string
    name: string
    email: string
    points: number
    level: number
    avatar?: string
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    login: (user: User) => void
    logout: () => void
    addPoints: (amount: number) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            login: (user) => set({ user, isAuthenticated: true }),
            logout: () => set({ user: null, isAuthenticated: false }),
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
