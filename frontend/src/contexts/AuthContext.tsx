'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<boolean>
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
  skinType?: string
  skinConcerns?: string[]
  newsletter?: boolean
  quizAnswers?: any
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; token: string } }
  | { type: 'CLEAR_USER' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false
      }
    case 'CLEAR_USER':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      }
    default:
      return state
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('userData')

    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        dispatch({ type: 'SET_USER', payload: { user, token } })
      } catch (error) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('authToken', data.data.token)
        localStorage.setItem('userData', JSON.stringify(data.data.user))
        dispatch({ type: 'SET_USER', payload: data.data })
        return true
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      dispatch({ type: 'SET_LOADING', payload: false })
      return false
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('authToken', data.data.token)
        localStorage.setItem('userData', JSON.stringify(data.data.user))
        dispatch({ type: 'SET_USER', payload: data.data })
        return true
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
        return false
      }
    } catch (error) {
      console.error('Registration error:', error)
      dispatch({ type: 'SET_LOADING', payload: false })
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    dispatch({ type: 'CLEAR_USER' })
  }

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('authToken')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}/api/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (data.success) {
        dispatch({ type: 'UPDATE_USER', payload: data.data })
        localStorage.setItem('userData', JSON.stringify(data.data))
        return true
      }
      return false
    } catch (error) {
      console.error('Update profile error:', error)
      return false
    }
  }

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
} 