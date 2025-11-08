import api from './api';

// Service para autenticação
export const authService = {
  // Login do usuário
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login/user', {
        email: credentials.email,
        password: credentials.password
      });
      
      // Se houver token na resposta, salvar no localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      // Se houver dados do usuário, salvar também
      if (response.data.user) {
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Login realizado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao fazer login. Verifique suas credenciais.',
        error: error.response?.data || error.message
      };
    }
  },

  // Logout do usuário
  logout: async () => {
    try {
      // Fazer requisição para logout na API (se necessário)
      await api.post('/auth/logout');
      
      // Limpar dados locais
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      return {
        success: true,
        message: 'Logout realizado com sucesso!'
      };
    } catch (error) {
      // Mesmo com erro na API, limpar dados locais
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      return {
        success: true,
        message: 'Logout realizado com sucesso!'
      };
    }
  },

  // Verificar se o usuário está autenticado
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  // Obter dados do usuário
  getUserData: () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  // Obter token
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  // Registrar novo usuário (se necessário)
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Usuário registrado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao registrar usuário.',
        error: error.response?.data || error.message
      };
    }
  },

  // Esqueci a senha
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Email de recuperação enviado!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao enviar email de recuperação.',
        error: error.response?.data || error.message
      };
    }
  }
};

export default authService;