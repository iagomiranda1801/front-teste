import axios from 'axios';

// Configuração base da API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000', // URL da sua API local
  timeout: import.meta.env.VITE_API_TIMEOUT || 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requisições (adicionar token se necessário)
api.interceptors.request.use(
  (config) => {
    // Adicionar token de autenticação se existir
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log da requisição em desenvolvimento
    if (import.meta.env.DEV) {
      console.log('🚀 Requisição:', {
        method: config.method?.toUpperCase(),
        url: config.url,
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
        data: response.data
      });
    }
    
    return response;
  },
  (error) => {
    // Tratamento de erros globais
    if (error.response) {
      // Servidor respondeu com status de erro
      console.error('❌ Erro da API:', {
        status: error.response.status,
        data: error.response.data,
        message: error.response.data?.message || 'Erro desconhecido'
      });
      
      // Se for erro 401, redirecionar para login
      if (error.response.status === 401) {
        localStorage.removeItem('authToken');
        // Aqui você pode redirecionar para a tela de login
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // Requisição foi feita mas não houve resposta
      console.error('❌ Erro de rede:', error.request);
    } else {
      // Outro tipo de erro
      console.error('❌ Erro:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;