import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { authService, userService } from '../services';

const ClientProfile = () => {
  const [userData, setUserData] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = authService.getUserData();
      setUserData(user);
      setEditData({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
      });
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      setMessage('Erro ao carregar dados do usuário');
    }
  };



  const handleEditProfile = async () => {
    setLoading(true);
    try {
      await userService.updateUser(userData.id, editData);
      setMessage('Perfil atualizado com sucesso!');
      setEditModalOpen(false);
      loadUserData();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setMessage('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'ativo':
        return 'success';
      case 'inativo':
        return 'error';
      case 'pendente':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (!userData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {message && (
        <Alert 
          severity={message.includes('Erro') ? 'error' : 'success'} 
          sx={{ mb: 3 }}
          onClose={() => setMessage('')}
        >
          {message}
        </Alert>
      )}

      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Meu Perfil
      </Typography>

      <Grid container spacing={3}>
        {/* Informações Pessoais */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    mr: 2,
                    bgcolor: 'rgba(255,255,255,0.2)'
                  }}
                >
                  <PersonIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {userData.name}
                  </Typography>
                  <Chip 
                    label={userData.type === 'client' ? 'Cliente' : userData.type}
                    size="small"
                    sx={{ 
                      mt: 1,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: 'white'
                    }}
                  />
                </Box>
              </Box>

              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setEditModalOpen(true)}
                sx={{ 
                  color: 'white', 
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Editar Perfil
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Detalhes do Contato */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Informações de Contato
              </Typography>

              <List>
                <ListItem sx={{ px: 0 }}>
                  <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText 
                    primary="Email"
                    secondary={userData.email}
                  />
                </ListItem>
                <Divider />
                <ListItem sx={{ px: 0 }}>
                  <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText 
                    primary="Telefone"
                    secondary={userData.phone || 'Não informado'}
                  />
                </ListItem>
                <Divider />
                <ListItem sx={{ px: 0 }}>
                  <CalendarIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText 
                    primary="Membro desde"
                    secondary={new Date(userData.createdAt || Date.now()).toLocaleDateString('pt-BR')}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Assinaturas */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Minhas Assinaturas
                </Typography>
              </Box>

              {subscriptions.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <Typography color="text.secondary">
                    Você não possui assinaturas ativas no momento.
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={2}>
                  {subscriptions.map((subscription) => (
                    <Grid item xs={12} md={6} key={subscription.id}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          border: '1px solid',
                          borderColor: 'grey.200',
                          borderRadius: 2
                        }}
                      >
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
                          <strong>Período:</strong> {subscription.startDate} até {subscription.endDate}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary">
                          <strong>Valor:</strong> {subscription.price}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal de Edição */}
      <Dialog 
        open={editModalOpen} 
        onClose={() => setEditModalOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Editar Perfil</DialogTitle>
        <DialogContent sx={{ pt: { xs: 4, sm: 5 } }}>
          <TextField
            autoFocus
            margin="dense"
            label="Nome"
            fullWidth
            variant="outlined"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={editData.email}
            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Telefone"
            fullWidth
            variant="outlined"
            value={editData.phone}
            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setEditModalOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleEditProfile}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientProfile;