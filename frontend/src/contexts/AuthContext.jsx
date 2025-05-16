import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUserProfile()
    } else {
      setLoading(false)
    }
  }, [])
  
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/users/profile/')
      setCurrentUser(response.data)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }
  
  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/token/', { username, password })
      const { access, refresh } = response.data
      
      localStorage.setItem('token', access)
      localStorage.setItem('refreshToken', refresh)
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`
      
      await fetchUserProfile()
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }
  
  const register = async (userData) => {
    try {
      const response = await axios.post('/api/users/register/', userData)
      console.log('Registration response:', response.data)
      return { success: true }
    } catch (error) {
      console.error('Registration error:', error)
      console.log('Error response data:', error.response?.data)
      return { 
        success: false, 
        errors: error.response?.data || { detail: 'Registration failed' }
      }
    }
  }
  
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    delete axios.defaults.headers.common['Authorization']
    setCurrentUser(null)
    setIsAuthenticated(false)
  }
  
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  }
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}