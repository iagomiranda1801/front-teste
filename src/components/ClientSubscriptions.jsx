import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery,
  IconButton
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Info as InfoIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { subscriptionService } from '../services';

const ClientSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const subscriptionsData = await subscriptionService.getMySubscriptions();
      setSubscriptions(subscriptionsData);
    } catch (error) {
      console.error('Erro ao carregar assinaturas:', error);
      // Em caso de erro, usar dados mockados para demonstração
      setSubscriptions([
        {
          id: 1,
          plan: 'Plano Premium',
          status: 'Ativo',
          startDate: '2024-01-15',
          endDate: '2024-12-15',
          price: 'R$ 99,90/mês',
          description: 'Acesso completo a todos os recursos premium',
          features: ['Suporte 24h', 'Backup automático', 'Acesso prioritário']
        },
        {
          id: 2,
          plan: 'Plano Básico',
          status: 'Expirado',
          startDate: '2023-06-01',
          endDate: '2023-12-01',
          price: 'R$ 39,90/mês',
          description: 'Recursos básicos para iniciantes',
          features: ['Suporte por email', 'Backup semanal']
        }
      ]);
      setMessage('Usando dados de demonstração (API indisponível)');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'ativo':
        return 'success';
      case 'inativo':
      case 'expirado':
        return 'error';
      case 'pendente':
        return 'warning';
      case 'cancelado':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleViewDetails = (subscription) => {
    setSelectedSubscription(subscription);
    setDetailModalOpen(true);
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (window.confirm('Tem certeza que deseja cancelar esta assinatura?')) {
      try {
        await subscriptionService.cancelSubscription(subscriptionId);
        setMessage('Assinatura cancelada com sucesso!');
        loadSubscriptions();
      } catch (error) {
        console.error('Erro ao cancelar assinatura:', error);
        setMessage('Erro ao cancelar assinatura');
      }
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {message && (
        <Alert 
          severity={message.includes('Erro') ? 'error' : 'info'} 
          sx={{ mb: 3 }}
          onClose={() => setMessage('')}
        >
          {message}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Minhas Assinaturas
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadSubscriptions}
          disabled={loading}
        >
          Atualizar
        </Button>
      </Box>

      {loading ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Carregando assinaturas...</Typography>
        </Paper>
      ) : subscriptions.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
          <AssignmentIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
          <Typography color="text.secondary" variant="h6" gutterBottom>
            Nenhuma assinatura encontrada
          </Typography>
          <Typography color="text.secondary">
            Você não possui assinaturas ativas no momento.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Cards para mobile */}
          {isMobile ? (
            <Grid container spacing={2}>
              {subscriptions.map((subscription) => (
                <Grid item xs={12} key={subscription.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Typography variant="h6" color="primary">
                          {subscription.plan}
                        </Typography>
                        <Chip 
                          label={subscription.status}
                          color={getStatusColor(subscription.status)}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Período:</strong> {formatDate(subscription.startDate)} até {formatDate(subscription.endDate)}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Valor:</strong> {subscription.price}
                      </Typography>

                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<InfoIcon />}
                          onClick={() => handleViewDetails(subscription)}
                        >
                          Detalhes
                        </Button>
                        {subscription.status.toLowerCase() === 'ativo' && (
                          <Button
                            size="small"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => handleCancelSubscription(subscription.id)}
                          >
                            Cancelar
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            /* Tabela para desktop */
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Plano</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Início</strong></TableCell>
                    <TableCell><strong>Vencimento</strong></TableCell>
                    <TableCell><strong>Valor</strong></TableCell>
                    <TableCell align="center"><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <Typography variant="subtitle2" color="primary">
                          {subscription.plan}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={subscription.status}
                          color={getStatusColor(subscription.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(subscription.startDate)}</TableCell>
                      <TableCell>{formatDate(subscription.endDate)}</TableCell>
                      <TableCell>{subscription.price}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(subscription)}
                            title="Ver detalhes"
                          >
                            <InfoIcon />
                          </IconButton>
                          {subscription.status.toLowerCase() === 'ativo' && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleCancelSubscription(subscription.id)}
                              title="Cancelar assinatura"
                            >
                              <CancelIcon />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Modal de Detalhes */}
      <Dialog 
        open={detailModalOpen} 
        onClose={() => setDetailModalOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          Detalhes da Assinatura
        </DialogTitle>
        <DialogContent sx={{ pt: { xs: 4, sm: 5 } }}>
          {selectedSubscription && (
            <Box>
              <Typography variant="h6" color="primary" gutterBottom>
                {selectedSubscription.plan}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Chip 
                  label={selectedSubscription.status}
                  color={getStatusColor(selectedSubscription.status)}
                  sx={{ mb: 2 }}
                />
              </Box>

              {selectedSubscription.description && (
                <Typography variant="body2" color="text.secondary" paragraph>
                  {selectedSubscription.description}
                </Typography>
              )}

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Data de Início:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(selectedSubscription.startDate)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Data de Vencimento:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(selectedSubscription.endDate)}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Valor:</strong> {selectedSubscription.price}
              </Typography>

              {selectedSubscription.features && selectedSubscription.features.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Recursos inclusos:</strong>
                  </Typography>
                  <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                    {selectedSubscription.features.map((feature, index) => (
                      <Typography component="li" variant="body2" key={index} gutterBottom>
                        {feature}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetailModalOpen(false)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientSubscriptions;