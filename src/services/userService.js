import api from './api';

// Service para usuários
export const userService = {
  // Buscar endereço por CEP
  searchCEP: async (cep) => {
    try {
      const cleanCep = cep.replace(/\D/g, '');
      if (cleanCep.length !== 8) {
        throw new Error('CEP deve ter 8 dígitos');
      }

      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        throw new Error('CEP não encontrado');
      }

      return {
        success: true,
        data: {
          endereco: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          uf: data.uf || '',
          cep: data.cep || cleanCep
        },
        message: 'Endereço encontrado com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Erro ao buscar CEP. Verifique se o CEP está correto.',
        error: error
      };
    }
  },
  // Registrar novo usuário
  register: async (userData) => {
    try {
      const response = await api.post('/v1/auth/register', userData);
      console.log(" Resposta do registro de usuário:", response.data);
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
      const response = await api.get('/v1/users');
      console.log('Resposta da API ao obter todos os usuários:', response);
      
      // Tratar diferentes estruturas de resposta da API
      let usersData = response.data;
      
      // Se a resposta tem uma propriedade 'data', usar ela
      if (response.data && response.data.data && response.data.data.users) {
        usersData = response.data.data.users;
      } else if (response.data && response.data.data && response.data.data.user) {
        usersData = [response.data.data.user];
      } else if (response.data && Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response.data && response.data.users) {
        usersData = response.data.users;
      }
      
      // Garantir que sempre seja um array
      if (!Array.isArray(usersData)) {
        console.warn('⚠️ API retornou dados que não são array:', usersData);
        usersData = [];
      }
      
      return {
        success: true,
        data: usersData,
        message: response.data.message || 'Usuários obtidos com sucesso!'
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
      const response = await api.get(`/v1/users/${userId}`);
      
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
      const response = await api.post('/v1/users', userData);
      
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
      const response = await api.put(`/v1/users/${userId}`, userData);
      
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
      const response = await api.delete(`/v1/users/${userId}`);
      
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