import api from './api';

const funcionarioService = {
  // Criar novo funcionário
  async createFuncionario(funcionarioData) {
    try {
      console.log('🚀 Criando funcionário:', funcionarioData);
      
      const response = await api.post('/v1/funcionarios', funcionarioData);
      
      console.log('✅ Funcionário criado com sucesso:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Funcionário criado com sucesso!'
      };
    } catch (error) {
      console.error('❌ Erro ao criar funcionário:', error);
      
      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message
        };
      }
      
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  },

  // Listar todos os funcionários com paginação
  async getAllFuncionarios(page = 1, limit = 10) {
    try {
      console.log('🔍 Buscando funcionários - Página:', page, 'Limite:', limit);
      
      const response = await api.get('/v1/funcionarios', {
        params: { page, limit }
      });
      
      console.log('✅ Funcionários encontrados:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Funcionários carregados com sucesso'
      };
    } catch (error) {
      console.error('❌ Erro ao buscar funcionários:', error);
      
      if (error.response?.status === 404) {
        return {
          success: true,
          data: [],
          message: 'Nenhum funcionário encontrado'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar funcionários'
      };
    }
  },

  // Buscar funcionário por ID
  async getFuncionarioById(id) {
    try {
      console.log('🔍 Buscando funcionário por ID:', id);
      
      const response = await api.get(`/v1/funcionarios/${id}`);
      
      console.log('✅ Funcionário encontrado:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Funcionário encontrado'
      };
    } catch (error) {
      console.error('❌ Erro ao buscar funcionário:', error);
      
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Funcionário não encontrado'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar funcionário'
      };
    }
  },

  // Buscar funcionário por CPF
  async getFuncionarioByCpf(cpf) {
    try {
      console.log('🔍 Buscando funcionário por CPF:', cpf);
      
      const response = await api.get(`/v1/funcionarios/cpf/${cpf}`);
      
      console.log('✅ Funcionário encontrado:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Funcionário encontrado'
      };
    } catch (error) {
      console.error('❌ Erro ao buscar funcionário por CPF:', error);
      
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Funcionário não encontrado'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar funcionário'
      };
    }
  },

  // Buscar funcionário por matrícula
  async getFuncionarioByMatricula(matricula) {
    try {
      console.log('🔍 Buscando funcionário por matrícula:', matricula);
      
      const response = await api.get(`/v1/funcionarios/matricula/${matricula}`);
      
      console.log('✅ Funcionário encontrado:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Funcionário encontrado'
      };
    } catch (error) {
      console.error('❌ Erro ao buscar funcionário por matrícula:', error);
      
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Funcionário não encontrado'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar funcionário'
      };
    }
  },

  // Buscar funcionários por nome (busca parcial)
  async getFuncionariosByNome(nome) {
    try {
      console.log('🔍 Buscando funcionários por nome:', nome);
      
      const response = await api.get(`/v1/funcionarios/nome/${nome}`);
      
      console.log('✅ Funcionários encontrados:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Funcionários encontrados'
      };
    } catch (error) {
      console.error('❌ Erro ao buscar funcionários por nome:', error);
      
      if (error.response?.status === 404) {
        return {
          success: true,
          data: [],
          message: 'Nenhum funcionário encontrado'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar funcionários'
      };
    }
  },

  // Buscar funcionários por empresa
  async getFuncionariosByEmpresa(idEmpresa) {
    try {
      console.log('🔍 Buscando funcionários por empresa:', idEmpresa);
      
      const response = await api.get(`/v1/funcionarios/empresa/${idEmpresa}`);
      
      console.log('✅ Funcionários encontrados:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Funcionários encontrados'
      };
    } catch (error) {
      console.error('❌ Erro ao buscar funcionários por empresa:', error);
      
      if (error.response?.status === 404) {
        return {
          success: true,
          data: [],
          message: 'Nenhum funcionário encontrado'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao buscar funcionários'
      };
    }
  },

  // Obter estatísticas de funcionários
  async getEstatisticas() {
    try {
      console.log('📊 Buscando estatísticas de funcionários');
      
      const response = await api.get('/v1/funcionarios/estatisticas');
      
      console.log('✅ Estatísticas encontradas:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Estatísticas carregadas'
      };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao carregar estatísticas'
      };
    }
  },

  // Atualizar funcionário
  async updateFuncionario(id, funcionarioData) {
    try {
      console.log('🔄 Atualizando funcionário:', id, funcionarioData);
      
      const response = await api.patch(`/v1/funcionarios/${id}`, funcionarioData);
      
      console.log('✅ Funcionário atualizado:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Funcionário atualizado com sucesso!'
      };
    } catch (error) {
      console.error('❌ Erro ao atualizar funcionário:', error);
      
      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message
        };
      }
      
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  },

  // Inativar funcionário (DELETE)
  async inativarFuncionario(id) {
    try {
      console.log('🗑️ Inativando funcionário:', id);
      
      const response = await api.delete(`/v1/funcionarios/${id}`);
      
      console.log('✅ Funcionário inativado:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Funcionário inativado com sucesso!'
      };
    } catch (error) {
      console.error('❌ Erro ao inativar funcionário:', error);
      
      if (error.response?.data?.message) {
        return {
          success: false,
          message: error.response.data.message
        };
      }
      
      return {
        success: false,
        message: 'Erro interno do servidor'
      };
    }
  }
};

export default funcionarioService;