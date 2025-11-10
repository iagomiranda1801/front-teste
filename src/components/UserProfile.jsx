import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
} from '@mui/icons-material';
import { userService, authService } from '../services';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Obter dados do usuário autenticado e buscar perfil pela API
    const local = authService.getUserData();
    const userId = local?.id || local?.userId || local?.user_id;

    if (userId) {
      // buscar via API
      (async () => {
        try {
          const res = await userService.getUserById(userId);
          if (res.success) {
            // API pode retornar objeto em diferentes estruturas; tentar extrair
            const data = res.data && (res.data.data || res.data.user || res.data || res.data[0]) || res.data;
            setUser(data);
          } else {
            // fallback para localStorage
            const userData = localStorage.getItem('userData') || localStorage.getItem('user');
            if (userData) setUser(JSON.parse(userData));
          }
        } catch (err) {
          console.error('Erro ao buscar perfil do usuário:', err);
          const userData = localStorage.getItem('userData') || localStorage.getItem('user');
          if (userData) setUser(JSON.parse(userData));
        }
      })();
    } else {
      // fallback para localStorage
      const userData = localStorage.getItem('userData') || localStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    }
  }, []);

  const handleChangePassword = async () => {
    // Validações
    if (!passwordData.senhaAtual) {
      setPasswordMessage({ type: 'error', text: 'Por favor, insira sua senha atual.' });
      return;
    }

    if (!passwordData.novaSenha) {
      setPasswordMessage({ type: 'error', text: 'Por favor, insira a nova senha.' });
      return;
    }

    if (passwordData.novaSenha.length < 6) {
      setPasswordMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    if (passwordData.novaSenha !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }

    if (passwordData.senhaAtual === passwordData.novaSenha) {
      setPasswordMessage({ type: 'error', text: 'A nova senha deve ser diferente da senha atual.' });
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://supply.i4app.com.br/api/v1/auth/alterar-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          senhaAtual: passwordData.senhaAtual,
          novaSenha: passwordData.novaSenha
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setPasswordMessage({ 
          type: 'success', 
          text: 'Senha alterada com sucesso!' 
        });
        // Fechar modal após 2 segundos e mostrar mensagem na tela principal
        setTimeout(() => {
          setChangePasswordModalOpen(false);
          setPasswordData({ senhaAtual: '', novaSenha: '', confirmPassword: '' });
          setPasswordMessage({ type: '', text: '' });
          setMessage({ 
            type: 'success', 
            text: 'Senha alterada com sucesso!' 
          });
        }, 2000);
      } else {
        setPasswordMessage({ 
          type: 'error', 
          text: result.message || 'Erro ao alterar senha.' 
        });
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      setPasswordMessage({ 
        type: 'error', 
        text: 'Erro de conexão. Tente novamente mais tarde.' 
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Carregando dados do usuário...</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Meu Perfil
      </Typography>

      {/* Mensagens de sucesso/erro */}
      {message.text && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Card de Informações Pessoais */}
        <Grid item xs={12} md={8}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PersonIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Informações Pessoais
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nome"
                    value={user.nome || user.name || 'Não informado'}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f9f9f9',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={user.email || 'Não informado'}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f9f9f9',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Telefone"
                    value={user.telefone || user.phone || 'Não informado'}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f9f9f9',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Cargo"
                    value={user.cargo || user.role || 'Não informado'}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#f9f9f9',
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Card do Avatar e Ações */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ borderRadius: 3, textAlign: 'center' }}>
            <CardContent sx={{ p: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem',
                  fontWeight: 'bold'
                }}
              >
                {getInitials(user.nome || user.name)}
              </Avatar>
              
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                {user.nome || user.name || 'Usuário'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {user.email}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Button
                variant="contained"
                fullWidth
                startIcon={<LockIcon />}
                onClick={() => setChangePasswordModalOpen(true)}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Alterar Senha
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal de Alterar Senha */}
      <Dialog 
        open={changePasswordModalOpen} 
        onClose={() => {
          setChangePasswordModalOpen(false);
          setPasswordData({ senhaAtual: '', novaSenha: '', confirmPassword: '' });
          setPasswordMessage({ type: '', text: '' });
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          <LockIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Alterar Senha
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
            Digite sua senha atual e a nova senha
          </Typography>
          
          {/* Mensagem de erro/sucesso dentro do modal */}
          {passwordMessage.text && (
            <Alert 
              severity={passwordMessage.type === 'error' ? 'error' : 'success'} 
              sx={{ mb: 2 }}
            >
              {passwordMessage.text}
            </Alert>
          )}
          
          {/* Campo Senha Atual */}
          <TextField
            autoFocus
            margin="dense"
            label="Senha Atual"
            type={showCurrentPassword ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={passwordData.senhaAtual}
            onChange={(e) => {
              setPasswordData(prev => ({ ...prev, senhaAtual: e.target.value }));
              if (passwordMessage.text) {
                setPasswordMessage({ type: '', text: '' });
              }
            }}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  edge="end"
                >
                  {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
              mb: 2
            }}
          />

          {/* Campo Nova Senha */}
          <TextField
            margin="dense"
            label="Nova Senha"
            type={showNewPassword ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={passwordData.novaSenha}
            onChange={(e) => {
              setPasswordData(prev => ({ ...prev, novaSenha: e.target.value }));
              if (passwordMessage.text) {
                setPasswordMessage({ type: '', text: '' });
              }
            }}
            helperText="A senha deve ter pelo menos 6 caracteres"
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  edge="end"
                >
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
              mb: 2
            }}
          />

          {/* Campo Confirmar Nova Senha */}
          <TextField
            margin="dense"
            label="Confirmar Nova Senha"
            type={showConfirmPassword ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={passwordData.confirmPassword}
            onChange={(e) => {
              setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }));
              if (passwordMessage.text) {
                setPasswordMessage({ type: '', text: '' });
              }
            }}
            error={passwordData.confirmPassword && passwordData.novaSenha !== passwordData.confirmPassword}
            helperText={
              passwordData.confirmPassword && passwordData.novaSenha !== passwordData.confirmPassword
                ? 'As senhas não coincidem' 
                : ''
            }
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => {
              setChangePasswordModalOpen(false);
              setPasswordData({ senhaAtual: '', novaSenha: '', confirmPassword: '' });
              setPasswordMessage({ type: '', text: '' });
            }}
            sx={{ 
              mr: 1,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleChangePassword}
            variant="contained"
            disabled={
              passwordLoading || 
              !passwordData.senhaAtual || 
              !passwordData.novaSenha || 
              !passwordData.confirmPassword ||
              passwordData.novaSenha !== passwordData.confirmPassword ||
              passwordData.novaSenha.length < 6
            }
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              },
              '&:disabled': {
                background: '#ccc',
                color: '#666',
              },
            }}
          >
            {passwordLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SaveIcon />
                Salvando...
              </Box>
            ) : (
              <>
                <SaveIcon sx={{ mr: 1 }} />
                Alterar Senha
              </>
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfile;