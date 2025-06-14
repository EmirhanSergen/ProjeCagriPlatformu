import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { getToken, logout as apiLogout } from '../api'

export interface AuthContextType {
  user: {
    id: number
    email: string
    role: 'admin' | 'reviewer' | 'applicant'
    firstName?: string
    lastName?: string
    organization?: string
  } | null
  role: string | null
  token: string | null
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null)
  const [token, setToken] = useState<string | null>(getToken() || null)
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      try {
        const decoded: any = jwtDecode(token)
        setUser({
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          firstName: decoded.firstName,
          lastName: decoded.lastName,
          organization: decoded.organization,
        })
      } catch {
        console.error('Invalid token')
        setUser(null)
      }
    }
  }, [token])

  const login = (token: string) => {
    setToken(token)
    try {
      const decoded: any = jwtDecode(token)
      setUser({
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        organization: decoded.organization,
      })
    } catch {
      console.error('Invalid token')
      setUser(null)
    }
  }

  const logout = () => {
    apiLogout()
    setUser(null)
    setToken(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, role: user?.role || null, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
