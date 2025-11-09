import api from './api';

// Service para gerenciamento de assinaturas
export const subscriptionService = {
  // Buscar todas as assinaturas (para admin)
  getAllSubscriptions: async () => {
    try {
      const response = await api.get('/subscriptions');
      console.log('Resposta das assinaturas:', response.data);
      
      // Verificar se a resposta contém os dados esperados
      const subscriptions = response.data?.data?.subscriptions || response.data?.subscriptions || response.data || [];
      
      // Garantir que retorna um array
      if (!Array.isArray(subscriptions)) {
        console.warn('Dados de assinaturas não são um array:', subscriptions);
        return [];
      }
      
      return subscriptions;
    } catch (error) {
      console.error('Erro ao buscar assinaturas:', error);
      throw error;
    }
  },

  // Buscar assinaturas do cliente logado
  getMySubscriptions: async () => {
    try {
      const response = await api.get('/subscriptions/my');
      console.log('Resposta das minhas assinaturas:', response.data);
      
      // Verificar se a resposta contém os dados esperados
      const subscriptions = response.data?.data?.subscriptions || response.data?.subscriptions || response.data || [];
      
      // Garantir que retorna um array
      if (!Array.isArray(subscriptions)) {
        console.warn('Dados de assinaturas não são um array:', subscriptions);
        return [];
      }
      
      return subscriptions;
    } catch (error) {
      console.error('Erro ao buscar minhas assinaturas:', error);
      throw error;
    }
  },

  // Buscar assinatura por ID
  getSubscriptionById: async (id) => {
    try {
      const response = await api.get(`/subscriptions/${id}`);
      return response.data?.data?.subscription || response.data?.subscription || response.data;
    } catch (error) {
      console.error('Erro ao buscar assinatura:', error);
      throw error;
    }
  },

  // Criar nova assinatura (para admin)
  createSubscription: async (subscriptionData) => {
    try {
      const response = await api.post('/subscriptions', subscriptionData);
      return response.data?.data?.subscription || response.data?.subscription || response.data;
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      throw error;
    }
  },

  // Atualizar assinatura (para admin)
  updateSubscription: async (id, subscriptionData) => {
    try {
      const response = await api.put(`/subscriptions/${id}`, subscriptionData);
      return response.data?.data?.subscription || response.data?.subscription || response.data;
    } catch (error) {
      console.error('Erro ao atualizar assinatura:', error);
      throw error;
    }
  },

  // Cancelar assinatura
  cancelSubscription: async (id) => {
    try {
      const response = await api.delete(`/subscriptions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      throw error;
    }
  },

  // Reativar assinatura
  reactivateSubscription: async (id) => {
    try {
      const response = await api.patch(`/subscriptions/${id}/reactivate`);
      return response.data?.data?.subscription || response.data?.subscription || response.data;
    } catch (error) {
      console.error('Erro ao reativar assinatura:', error);
      throw error;
    }
  }
};

export default subscriptionService;