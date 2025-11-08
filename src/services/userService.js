import api from './api';

// Service para usuários
export const userService = {
  // Registrar novo usuário
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register/user/public', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: 'client' // Sempre cliente conforme solicitado
      });
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Usuário cadastrado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao cadastrar usuário. Tente novamente.',
        error: error.response?.data || error.message
      };
    }
  },

  // Obter perfil do usuário
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      
      return {
        success: true,
        data: response.data,
        message: 'Perfil obtido com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao obter perfil do usuário.',
        error: error.response?.data || error.message
      };
    }
  },

  // Atualizar perfil do usuário
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Perfil atualizado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar perfil.',
        error: error.response?.data || error.message
      };
    }
  },

  // Listar todos os usuários (admin)
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      
      return {
        success: true,
        data: response.data,
        message: 'Usuários obtidos com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao obter usuários.',
        error: error.response?.data || error.message
      };
    }
  },

  // Obter usuário específico por ID (admin)
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      
      return {
        success: true,
        data: response.data,
        message: 'Usuário obtido com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao obter usuário.',
        error: error.response?.data || error.message
      };
    }
  },

  // Criar usuário (admin)
  createUser: async (userData) => {
    try {
      const response = await api.post('/users', userData);
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Usuário criado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao criar usuário.',
        error: error.response?.data || error.message
      };
    }
  },

  // Atualizar usuário (admin)
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}`, userData);
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Usuário atualizado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar usuário.',
        error: error.response?.data || error.message
      };
    }
  },

  // Deletar usuário (admin)
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`);
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Usuário deletado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao deletar usuário.',
        error: error.response?.data || error.message
      };
    }
  }
};

export default userService;