import api from './api';

// Service para dados do dashboard
export const dashboardService = {
  // Buscar estatísticas gerais do sistema
  getSystemStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      console.log('Resposta das estatísticas:', response.data);
      
      return response.data?.data || response.data || {
        totalUsers: 0,
        activeSubscriptions: 0,
        totalInvoices: 0,
        monthlyRevenue: 'R$ 0,00'
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      // Dados fallback para demonstração
      return {
        totalUsers: 150,
        activeSubscriptions: 89,
        totalInvoices: 245,
        monthlyRevenue: 'R$ 15.420,00'
      };
    }
  },

  // Buscar últimos acessos dos usuários
  getRecentAccess: async (limit = 10) => {
    try {
      const response = await api.get(`/dashboard/recent-access?limit=${limit}`);
      console.log('Resposta dos últimos acessos:', response.data);
      
      const accessData = response.data?.data?.accesses || response.data?.accesses || response.data || [];
      
      // Garantir que retorna um array
      if (!Array.isArray(accessData)) {
        console.warn('Dados de acesso não são um array:', accessData);
        return [];
      }
      
      return accessData;
    } catch (error) {
      console.error('Erro ao buscar últimos acessos:', error);
      // Dados fallback para demonstração
      return [
        {
          id: 1,
          user: 'João Silva',
          email: 'joao@email.com',
          lastAccess: new Date().toISOString(),
          ip: '192.168.1.100',
          device: 'Chrome/Windows'
        },
        {
          id: 2,
          user: 'Maria Santos',
          email: 'maria@email.com',
          lastAccess: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          ip: '192.168.1.101',
          device: 'Safari/MacOS'
        },
        {
          id: 3,
          user: 'Pedro Costa',
          email: 'pedro@email.com',
          lastAccess: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          ip: '192.168.1.102',
          device: 'Firefox/Linux'
        }
      ];
    }
  },

  // Buscar dados de faturamento
  getRevenueData: async (period = 'month') => {
    try {
      const response = await api.get(`/dashboard/revenue?period=${period}`);
      console.log('Resposta do faturamento:', response.data);
      
      return response.data?.data || response.data || {
        currentPeriod: 'R$ 0,00',
        previousPeriod: 'R$ 0,00',
        growth: 0,
        chartData: []
      };
    } catch (error) {
      console.error('Erro ao buscar dados de faturamento:', error);
      // Dados fallback para demonstração
      return {
        currentPeriod: 'R$ 15.420,00',
        previousPeriod: 'R$ 12.800,00',
        growth: 20.47,
        chartData: [
          { month: 'Jan', value: 8500 },
          { month: 'Fev', value: 9200 },
          { month: 'Mar', value: 11000 },
          { month: 'Abr', value: 12800 },
          { month: 'Mai', value: 15420 }
        ]
      };
    }
  },

  // Buscar distribuição de usuários por tipo
  getUserDistribution: async () => {
    try {
      const response = await api.get('/dashboard/user-distribution');
      console.log('Resposta da distribuição de usuários:', response.data);
      
      return response.data?.data || response.data || {
        admin: 0,
        client: 0,
        total: 0
      };
    } catch (error) {
      console.error('Erro ao buscar distribuição de usuários:', error);
      // Dados fallback para demonstração
      return {
        admin: 5,
        client: 145,
        total: 150
      };
    }
  },

  // Buscar status das assinaturas
  getSubscriptionStatus: async () => {
    try {
      const response = await api.get('/dashboard/subscription-status');
      console.log('Resposta do status das assinaturas:', response.data);
      
      return response.data?.data || response.data || {
        active: 0,
        inactive: 0,
        pending: 0,
        cancelled: 0
      };
    } catch (error) {
      console.error('Erro ao buscar status das assinaturas:', error);
      // Dados fallback para demonstração
      return {
        active: 89,
        inactive: 12,
        pending: 8,
        cancelled: 15
      };
    }
  }
};

export default dashboardService;