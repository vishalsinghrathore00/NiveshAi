"use client"

import { useState, useEffect, useCallback } from "react"

interface User {
  id: number
  email: string
  firstName: string | null
  lastName: string | null
  profileImageUrl: string | null
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/user")
      const data = await response.json()
      
      setState({
        user: data.user || null,
        isLoading: false,
        isAuthenticated: !!data.user,
      })
    } catch {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Login failed")
    }

    setState({
      user: data.user,
      isLoading: false,
      isAuthenticated: true,
    })

    return data.user
  }

  const signup = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, firstName, lastName }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Signup failed")
    }

    setState({
      user: data.user,
      isLoading: false,
      isAuthenticated: true,
    })

    return data.user
  }

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })

    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    })
  }

  return {
    ...state,
    login,
    signup,
    logout,
    refetch: fetchUser,
  }
}
