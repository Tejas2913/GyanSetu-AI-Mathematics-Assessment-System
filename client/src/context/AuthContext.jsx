// AuthContext — Provides auth state (user, role, loading) to the app

import { createContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function resolveRole(userId) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) return

        const headers = {
          'Authorization': `Bearer ${token}`,
        }

        const res = await fetch(
          `/api/v1/auth/me?user_id=${encodeURIComponent(userId)}`,
          { headers }
        )

        if (res.ok) {
          const data = await res.json()
          if (!cancelled && data?.role) {
            setRole(data.role)
            return
          }
        }
      } catch {
        // Silently fail — fallback to null role
      }
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      const metaRole = u?.user_metadata?.role ?? null
      setRole(metaRole)
      if (u?.id && !metaRole) {
        await resolveRole(u.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user ?? null
        setUser(u)
        if (!u) {
          // User signed out — clear role
          setRole(null)
          return
        }
        const metaRole = u?.user_metadata?.role ?? null
        if (metaRole) {
          // Metadata has a role — use it
          setRole(metaRole)
        } else {
          // Don't overwrite an already-resolved role with null.
          // Only call resolveRole if we don't have a role yet.
          setRole((prevRole) => {
            if (!prevRole) {
              resolveRole(u.id)
            }
            return prevRole  // keep whatever we already have
          })
        }
      }
    )

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
