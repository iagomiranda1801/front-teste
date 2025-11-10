import api, { tokenManager } from './api';

// Service para autenticação
export const authService = {
  // Login do usuário
  login: async (credentials) => {
    try {
      const response = await api.post('/v1/auth/login', {
        email: credentials.email,
        senha: credentials.password
      });
      
      // Se houver token na resposta, salvar usando tokenManager
      if (response.data.access_token) {
        console.log('Salvando token de autenticação');
        const token = response.data.access_token;
        tokenManager.setToken(token);
      }
      
      // Se houver dados do usuário, salvar também
      if (response.data.user) {
        console.log('Salvando dados do usuário');
        const user = response.data.user;
        localStorage.setItem('userData', JSON.stringify(user));
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
      
      // Limpar dados locais usando tokenManager
      tokenManager.removeToken();
      localStorage.removeItem('userData');
      
      return {
        success: true,
        message: 'Logout realizado com sucesso!'
      };
    } catch (error) {
      // Mesmo com erro na API, limpar dados locais
      tokenManager.removeToken();
      localStorage.removeItem('userData');
      
      return {
        success: true,
        message: 'Logout realizado com sucesso!'
      };
    }
  },

  // Verificar se o usuário está autenticado
  isAuthenticated: () => {
    return tokenManager.isValidToken();
  },

  // Obter dados do usuário
  getUserData: () => {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
      return null;
    }
  },

  // Obter token
  getToken: () => {
    return tokenManager.getToken();
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