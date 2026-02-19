/**
 * API client for GreenLens backend.
 * Set NEXT_PUBLIC_API_URL in .env.local (e.g. http://localhost:3000).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ""

export function getApiUrl(path: string): string {
  const base = API_URL.replace(/\/$/, "")
  const p = path.startsWith("/") ? path : `/${path}`
  return `${base}${p}`
}

export function getAuthHeaders(token: string | null): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" }
  if (token) headers["Authorization"] = `Bearer ${token}`
  return headers
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, ...init } = options
  const url = getApiUrl(path)
  
  // Better error message if API_URL is not configured
  if (!API_URL) {
    throw new Error(
      "Backend API URL not configured. Please set NEXT_PUBLIC_API_URL in .env.local (e.g. http://localhost:3000). " +
      "Make sure the backend is running on that port."
    )
  }
  
  try {
    const res = await fetch(url, {
      ...init,
      headers: { ...getAuthHeaders(token ?? null), ...(init.headers as HeadersInit) },
      credentials: "include",
    })
    const data = (await res.json().catch(() => ({}))) as T & { error?: string; code?: string }
    if (!res.ok) {
      let message = data?.error ?? res.statusText
      if (res.status === 404) {
        message = `Backend endpoint not found: ${url}. Make sure the backend is running and the API route exists.`
      } else if (res.status === 0 || res.status >= 500) {
        message = `Cannot connect to backend at ${url}. Is the backend server running?`
      }
      const err = new Error(message) as Error & { code?: string }
      err.code = data?.code
      throw err
    }
    return data as T
  } catch (err) {
    // Network errors (CORS, connection refused, etc.)
    if (err instanceof TypeError && err.message.includes("fetch")) {
      throw new Error(
        `Cannot connect to backend at ${url}. ` +
        "Please check: 1) Backend is running, 2) NEXT_PUBLIC_API_URL is correct, 3) CORS is configured."
      )
    }
    throw err
  }
}

// Auth
export const authApi = {
  register: (body: { email: string; password: string; name?: string }) =>
    apiFetch<{ success: boolean; userId: string; email: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  login: (body: { email: string; password: string }) =>
    apiFetch<{ token: string; user: { id: string; name?: string; email: string; points: number; level: number; streakDays?: number } }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify(body) }
    ),
}

// Products
export const productsApi = {
  lookup: (barcode: string) =>
    apiFetch<{
      id: string
      barcode: string
      name: string
      brand: string | null
      category: string | null
      imageUrl: string | null
      carbonFootprint: number
      ecoScore: string
      nutriScore?: string | null
      novaScore?: number | null
      scanCount?: number
    }>("/api/products/lookup", {
      method: "POST",
      body: JSON.stringify({ barcode }),
    }),
  get: (barcode: string) =>
    apiFetch<{
      id: string
      barcode: string
      name: string
      carbonFootprint: number
      ecoScore: string
      imageUrl: string | null
    }>(`/api/products/${encodeURIComponent(barcode)}`),
  alternatives: (barcode: string) =>
    apiFetch<{
      alternatives: Array<{
        id: string
        barcode: string
        name: string
        brand: string | null
        imageUrl: string | null
        carbonFootprint: number
        ecoScore: string
        carbonReduction: number
      }>
    }>(`/api/products/${encodeURIComponent(barcode)}/alternatives`),
}

// Scans (require token)
export function scansApi(token: string | null) {
  return {
    record: (body: { barcode: string; productId?: string; productName?: string; carbonFootprint?: number }) =>
      apiFetch<{ id: string; barcode: string; productName: string; carbonFootprint: number; pointsEarned: number; createdAt: string }>(
        "/api/scans",
        { method: "POST", body: JSON.stringify(body), token }
      ),
    list: (params?: { limit?: number; offset?: number }) => {
      const q = new URLSearchParams()
      if (params?.limit) q.set("limit", String(params.limit))
      if (params?.offset) q.set("offset", String(params.offset))
      return apiFetch<{ scans: unknown[]; pagination: { total: number; limit: number; offset: number } }>(
        `/api/scans?${q.toString()}`,
        { token }
      )
    },
  }
}

// User (require token)
export function userApi(token: string | null) {
  return {
    profile: () =>
      apiFetch<{ id: string; email: string; name: string | null; totalPoints: number; streakDays: number; level: number }>(
        "/api/user/profile",
        { token }
      ),
    stats: () =>
      apiFetch<{
        level: number
        totalPoints: number
        streakDays: number
        scanCount: number
        completedChallenges: number
        earnedBadges: number
        ecoFriendlyScans: number
        topCategories: Array<{ category: string; count: number }>
      }>("/api/user/stats", { token }),
  }
}
