import { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import { authService } from './services'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated()
      const token = authService.getToken()
      const userData = authService.getUserData()
      
      console.log('🔍 Verificando autenticação:', {
        authenticated,
        hasToken: !!token,
        hasUserData: !!userData,
        token: token ? `${token.substring(0, 20)}...` : null
      })
      
      setIsAuthenticated(authenticated)
      setLoading(false)
    }

    checkAuth()

    // Escutar mudanças no localStorage (logout em outra aba)
    const handleStorageChange = () => {
      console.log('📱 LocalStorage mudou, verificando auth novamente')
      checkAuth()
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleLogin = () => {
    console.log('🚀 Login bem-sucedido, redirecionando para dashboard...')
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    console.log('🚪 Fazendo logout...')
    setIsAuthenticated(false)
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        Carregando...
      </div>
    )
  }

  return (
    <div className="App">
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  )
}

export default App
