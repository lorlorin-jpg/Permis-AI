import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import Constants from 'expo-constants'
import { useAuthStore } from '@store/auth.store'

const API_BASE_URL =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  process.env.EXPO_PUBLIC_API_URL ??
  'http://localhost:3000'

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor — inject auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { session } = useAuthStore.getState()
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor — handle 401 and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      const { session } = useAuthStore.getState()

      if (!session?.refresh_token) {
        useAuthStore.getState().logout()
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            resolve(apiClient(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Call refresh endpoint
        const response = await axios.post<{ access_token: string; refresh_token: string }>(
          `${API_BASE_URL}/api/auth/refresh`,
          { refresh_token: session.refresh_token },
        )

        const { access_token, refresh_token } = response.data

        const { setSession } = useAuthStore.getState()
        setSession({
          ...session,
          access_token,
          refresh_token,
          expires_at: Date.now() + 3600 * 1000,
        })

        onRefreshed(access_token)
        isRefreshing = false

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`
        }

        return apiClient(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
        useAuthStore.getState().logout()
        return Promise.reject(refreshError)
      }
    }

    // Parse API error messages
    if (error.response?.data) {
      const data = error.response.data as { error?: string; message?: string }
      const message = data.error ?? data.message ?? error.message
      return Promise.reject(new Error(message))
    }

    return Promise.reject(error)
  },
)

export default apiClient
