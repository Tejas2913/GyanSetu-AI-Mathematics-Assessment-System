// authService.js — Supabase Auth calls (signup, login, signout)

import { supabase } from '../lib/supabaseClient'
import api from './api'

export async function signUp({ email, password, name, role, teacher_email, parent_email }) {
  // Step 1: Create Supabase Auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
    },
  })
  if (error) throw error

  // Step 2: Create profile in the corresponding role table via backend
  await api.post('/auth/signup', {
    user_id: data.user.id,
    email,
    name,
    role,
    teacher_email: teacher_email || undefined,
    parent_email: parent_email || undefined,
  })

  return data
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}
