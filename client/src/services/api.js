// api.js — Axios instance with base URL and auth headers

import axios from 'axios'
import { supabase } from '../lib/supabaseClient'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s timeout (AI grading can take 10-20s for complex answers)
})

// Attach Supabase JWT to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — redirect to login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
