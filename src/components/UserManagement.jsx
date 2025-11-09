import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Avatar,
  Tooltip,
  CircularProgress,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { userService, authService } from '../services';

const UserManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client',
  });
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const user = authService.getUserData();
    setCurrentUser(user);
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await userService.getAllUsers();
      console.log('🔍 Resultado da API getAllUsers:', result);
      
      if (result.success) {
        const usersData = result.data || [];
        console.log('👥 Usuários recebidos:', usersData, 'É array?', Array.isArray(usersData));
        setUsers(usersData);
      } else {
        console.error('❌ Erro na API:', result.message);
        setMessage({ type: 'error', text: result.message });
        setUsers([]); // Garantir que seja um array vazio em caso de erro
      }
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar usuários' });
      setUsers([]); // Garantir que seja um array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, user = null) => {
    setDialogMode(mode);
    setSelectedUser(user);
    
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'client',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'client',
      });
    }
    
    setFormErrors({});
    setMessage({ type: '', text: '' });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setFormData({ name: '', email: '', password: '', role: 'client' });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (dialogMode === 'create' && !formData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!formData.role) {
      errors.role = 'Role é obrigatório';
    }

    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormLoading(true);
    try {
      let result;
      
      if (dialogMode === 'create') {
        result = await userService.createUser(formData);
      } else if (dialogMode === 'edit') {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password; // Não atualizar senha se estiver vazia
        }
        result = await userService.updateUser(selectedUser.id, updateData);
      }

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        handleCloseDialog();
        loadUsers();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro inesperado' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (user) => {
    if (user.id === currentUser?.id) {
      setMessage({ type: 'error', text: 'Você não pode excluir a si mesmo!' });
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
      try {
        const result = await userService.deleteUser(user.id);
        if (result.success) {
          setMessage({ type: 'success', text: result.message });
          loadUsers();
        } else {
          setMessage({ type: 'error', text: result.message });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Erro ao excluir usuário' });
      }
    }
  };

  const filteredUsers = (Array.isArray(users) ? users : []).filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'client': return 'primary';
      default: return 'default';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'client': return 'Cliente';
      default: return role;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Gerenciamento de Usuários
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadUsers}
            disabled={loading}
          >
            Atualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('create')}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              },
            }}
          >
            Novo Usuário
          </Button>
        </Box>
      </Box>

      {/* Messages */}
      {message.text && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 2 }}
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Pesquisar usuários"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
            }}
          />
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Usuário</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {user.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2">
                              {user.name}
                              {user.id === currentUser?.id && (
                                <Chip label="Você" size="small" sx={{ ml: 1 }} />
                              )}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {user.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={getRoleLabel(user.role)}
                          color={getRoleColor(user.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                          <Tooltip title="Visualizar">
                            <IconButton
                              color="info"
                              onClick={() => handleOpenDialog('view', user)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton
                              color="primary"
                              onClick={() => handleOpenDialog('edit', user)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          {user.id !== currentUser?.id && (
                            <Tooltip title="Excluir">
                              <IconButton
                                color="error"
                                onClick={() => handleDelete(user)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">
                          Nenhum usuário encontrado
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* User Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        scroll="body"
        PaperProps={{
          sx: { 
            borderRadius: 3,
            margin: { xs: 2, sm: 3 }, // Margem responsiva
            maxHeight: { xs: 'calc(100vh - 64px)', sm: 'calc(100vh - 100px)' }, // Altura máxima responsiva
            position: 'relative',
            top: { xs: 32, sm: 50 }, // Gap do header responsivo
          }
        }}
        sx={{
          '& .MuiDialog-container': {
            alignItems: { xs: 'flex-start', sm: 'center' }, // Alinhamento responsivo
            paddingTop: { xs: 2, sm: 0 }, // Padding top responsivo
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          pb: 2, // Padding inferior para dar espaço
          mb: 1, // Margin inferior
        }}>
          {dialogMode === 'create' && 'Novo Usuário'}
          {dialogMode === 'edit' && 'Editar Usuário'}
          {dialogMode === 'view' && 'Visualizar Usuário'}
        </DialogTitle>

        <DialogContent sx={{ 
          pt: { xs: 4, sm: 5 }, // Mais padding superior responsivo
          pb: 3,
          px: { xs: 2, sm: 3 }, // Padding horizontal responsivo
          mt: 1, // Margin top adicional
          maxHeight: { xs: '60vh', sm: '70vh' }, // Altura máxima do conteúdo
          overflowY: 'auto', // Scroll quando necessário
        }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!formErrors.name}
                helperText={formErrors.name}
                disabled={dialogMode === 'view' || formLoading}
                sx={{ mt: 1 }} // Margem superior adicional para o primeiro campo
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={!!formErrors.email}
                helperText={formErrors.email}
                disabled={dialogMode === 'view' || formLoading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={dialogMode === 'edit' ? 'Nova Senha (deixe vazio para não alterar)' : 'Senha'}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={!!formErrors.password}
                helperText={formErrors.password}
                disabled={dialogMode === 'view' || formLoading}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={!!formErrors.role}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  disabled={dialogMode === 'view' || formLoading}
                >
                  <MenuItem value="client">Cliente</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
                {formErrors.role && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {formErrors.role}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

                <DialogActions sx={{ 
          p: 3, 
          pt: 2,
          px: { xs: 2, sm: 3 }, // Padding horizontal responsivo
          flexDirection: { xs: 'column', sm: 'row' }, // Stack vertical em mobile
          gap: { xs: 1, sm: 2 }, // Gap entre botões
        }}>
          <Button 
            onClick={handleCloseDialog} 
            disabled={formLoading}
            fullWidth={isMobile} // Full width em mobile
            sx={{ 
              minWidth: { xs: '100%', sm: 'auto' },
              order: { xs: 2, sm: 1 } // Ordem dos botões em mobile
            }}
          >
            {dialogMode === 'view' ? 'Fechar' : 'Cancelar'}
          </Button>
          {dialogMode !== 'view' && (
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={formLoading}
              fullWidth={isMobile} // Full width em mobile
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
                minWidth: { xs: '100%', sm: 'auto' },
                order: { xs: 1, sm: 2 } // Ordem dos botões em mobile
              }}
            >
              {formLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                dialogMode === 'create' ? 'Criar' : 'Salvar'
              )}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;