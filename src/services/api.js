import axios from 'axios';

// Chave para armazenar o token no localStorage
const TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';

// Configuração base da API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: import.meta.env.VITE_API_TIMEOUT || 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Importante para CORS
});

// Funções para gerenciar token
export const tokenManager = {
  // Obter token do localStorage
  getToken: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  },

  // Salvar token no localStorage
  setToken: (token) => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        // Atualizar header padrão do axios
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Erro ao salvar token:', error);
    }
  },

  // Remover token do localStorage
  removeToken: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      // Remover header de autorização
      delete api.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Erro ao remover token:', error);
    }
  },

  // Verificar se o token existe e é válido
  isValidToken: () => {
    const token = tokenManager.getToken();
    if (!token) {
      console.log('🔍 Token não encontrado');
      return false;
    }

    console.log('🔍 Token encontrado:', token.substring(0, 20) + '...');

    // Por enquanto, vamos considerar válido se o token existir
    // TODO: Implementar validação de expiração JWT quando necessário
    try {
      // Verificar se o token tem formato básico de JWT (3 partes separadas por ponto)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('⚠️ Token não tem formato JWT válido');
        return false;
      }

      // Tentar decodificar o payload para verificar expiração
      try {
        const payload = JSON.parse(atob(parts[1]));
        const currentTime = Date.now() / 1000;
        
        if (payload.exp && payload.exp < currentTime) {
          console.warn('⏰ Token expirado');
          tokenManager.removeToken();
          return false;
        }
        
        console.log('✅ Token válido');
        return true;
      } catch (decodeError) {
        // Se não conseguir decodificar, mas o token existe, considerar válido
        console.warn('⚠️ Não foi possível decodificar JWT, mas token existe:', decodeError);
        return true;
      }
    } catch (error) {
      console.error('❌ Erro ao validar token:', error);
      return false;
    }
  }
};

// Inicializar token se existir no localStorage
const existingToken = tokenManager.getToken();
if (existingToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${existingToken}`;
}

// Interceptor para requisições
api.interceptors.request.use(
  (config) => {
    // Verificar e adicionar token se necessário
    const token = tokenManager.getToken();
    if (token && tokenManager.isValidToken()) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token && !tokenManager.isValidToken()) {
      // Token expirado, removê-lo
      tokenManager.removeToken();
    }
    
    // Log da requisição em desenvolvimento
    if (import.meta.env.DEV) {
      console.log('🚀 Requisição:', {
        method: config.method?.toUpperCase(),
        url: config.baseURL + config.url,
        headers: {
          'Authorization': config.headers.Authorization ? 'Bearer ***' : 'Não autenticado',
          'Content-Type': config.headers['Content-Type']
        },
        data: config.data
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    // Log da resposta em desenvolvimento
    if (import.meta.env.DEV) {
      console.log('✅ Resposta:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }
    
    return response;
  },
  (error) => {
    // Tratamento de erros globais
    if (error.response) {
      const { status, data } = error.response;
      
      console.error('❌ Erro da API:', {
        status,
        data,
        message: data?.message || 'Erro desconhecido',
        url: error.config?.url
      });
      
      // Se for erro 401 (Unauthorized), apenas limpar token
      if (status === 401) {
        console.warn('🔒 Token inválido ou expirado. Removendo autenticação.');
        tokenManager.removeToken();
        
        // Apenas limpar o token, sem recarregar a página
        // O componente App.jsx já escuta mudanças no localStorage
      }
      
      // Se for erro 403 (Forbidden)
      if (status === 403) {
        console.error('🚫 Acesso negado. Permissões insuficientes.');
      }
      
    } else if (error.request) {
      // Requisição foi feita mas não houve resposta (erro de rede)
      console.error('❌ Erro de rede:', {
        message: 'Servidor não respondeu',
        request: error.request
      });
    } else {
      // Outro tipo de erro
      console.error('❌ Erro:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;