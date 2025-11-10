import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  FormControlLabel,
  Checkbox,
  Link,
  CircularProgress,
  Container,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { 
  LockOutlined as LockIcon,
  Email as EmailIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { authService } from '../services';
import RegisterModal from './RegisterModal';

// Tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      dark: '#764ba2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
  },
});

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState({ type: '', text: '' });
  
  // Estados para o modal de redefinir senha
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    token: '',
    novaSenha: '',
    confirmPassword: ''
  });
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [resetPasswordMessage, setResetPasswordMessage] = useState({ type: '', text: '' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Remove error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    console.log('Enviando dados de login:', formData);
    try {
      // Chamar a API real
      const result = await authService.login({
        email: formData.email,
        password: formData.password
      });
      console.log('Resultado do login:', result);
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: result.message 
        });
        
        // Redirecionar imediatamente após login bem-sucedido
        console.log('Usuário logado com sucesso!', result.data);
        
        // Chamar onLogin imediatamente para redirecionar
        onLogin && onLogin();
      } else {
        setMessage({ 
          type: 'error', 
          text: result.message 
        });
      }
    } catch (error) {
      console.error('Erro inesperado no login:', error);
      setMessage({ 
        type: 'error', 
        text: 'Erro inesperado. Tente novamente mais tarde.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setForgotPasswordMessage({ type: 'error', text: 'Por favor, insira seu email.' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
      setForgotPasswordMessage({ type: 'error', text: 'Por favor, insira um email válido.' });
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordMessage({ type: '', text: '' }); // Limpa mensagens anteriores
    
    try {
      const response = await fetch('http://supply.i4app.com.br/api/v1/auth/recuperar-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotPasswordEmail
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setForgotPasswordMessage({ 
          type: 'success', 
          text: 'Instruções de recuperação enviadas para seu email!' 
        });
        // Fechar modal de esqueci senha e abrir modal de redefinir senha após 2 segundos
        setTimeout(() => {
          setForgotPasswordModalOpen(false);
          setForgotPasswordEmail('');
          setForgotPasswordMessage({ type: '', text: '' });
          setResetPasswordModalOpen(true);
        }, 2000);
      } else {
        setForgotPasswordMessage({ 
          type: 'error', 
          text: result.message || 'Erro ao enviar email de recuperação.' 
        });
      }
    } catch (error) {
      console.error('Erro ao recuperar senha:', error);
      setForgotPasswordMessage({ 
        type: 'error', 
        text: 'Erro de conexão. Tente novamente mais tarde.' 
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResetPassword = async () => {
    // Validações
    if (!resetPasswordData.token.trim()) {
      setResetPasswordMessage({ type: 'error', text: 'Por favor, insira o token recebido por email.' });
      return;
    }

    if (!resetPasswordData.novaSenha) {
      setResetPasswordMessage({ type: 'error', text: 'Por favor, insira a nova senha.' });
      return;
    }

    if (resetPasswordData.novaSenha.length < 6) {
      setResetPasswordMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    if (resetPasswordData.novaSenha !== resetPasswordData.confirmPassword) {
      setResetPasswordMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }

    setResetPasswordLoading(true);
    setResetPasswordMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://supply.i4app.com.br/api/v1/auth/redefinir-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetPasswordData.token,
          novaSenha: resetPasswordData.novaSenha
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setResetPasswordMessage({ 
          type: 'success', 
          text: 'Senha redefinida com sucesso!' 
        });
        // Fechar modal após 2 segundos e mostrar mensagem na tela principal
        setTimeout(() => {
          setResetPasswordModalOpen(false);
          setResetPasswordData({ token: '', novaSenha: '', confirmPassword: '' });
          setResetPasswordMessage({ type: '', text: '' });
          setMessage({ 
            type: 'success', 
            text: 'Senha redefinida com sucesso! Você já pode fazer login com a nova senha.' 
          });
        }, 2000);
      } else {
        setResetPasswordMessage({ 
          type: 'error', 
          text: result.message || 'Erro ao redefinir senha.' 
        });
      }
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      setResetPasswordMessage({ 
        type: 'error', 
        text: 'Erro de conexão. Tente novamente mais tarde.' 
      });
    } finally {
      setResetPasswordLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          height: '100vh',
          width: '100vw',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
          position: 'fixed',
          top: 0,
          left: 0,
          overflow: 'auto',
        }}
      >
        <Container maxWidth="sm">
          <Card
            elevation={24}
            sx={{
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              overflow: 'visible',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {/* Header com Avatar */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    m: 1,
                    bgcolor: 'primary.main',
                    width: 56,
                    height: 56,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  <LockIcon />
                </Avatar>
                <Typography 
                  component="h1" 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}
                >
                  Bem-vindo de volta!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Faça login para continuar
                </Typography>
              </Box>

              {/* Mensagens de erro/sucesso */}
              {message.text && (
                <Alert 
                  severity={message.type} 
                  sx={{ mb: 2, borderRadius: 2 }}
                  onClose={() => setMessage({ type: '', text: '' })}
                >
                  {message.text}
                </Alert>
              )}

              {/* Formulário */}
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{
                    startAdornment: <LockIcon sx={{ mr: 1, color: 'action.active' }} />,
                    endAdornment: (
                      <Button
                        onClick={() => setShowPassword(!showPassword)}
                        sx={{ minWidth: 'auto', p: 1 }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </Button>
                    ),
                  }}
                />

                {/* Opções do formulário */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        value={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Lembrar de mim"
                  />
                  <Link
                    href="#"
                    variant="body2"
                    onClick={(e) => {
                      e.preventDefault();
                      setForgotPasswordModalOpen(true);
                    }}
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Esqueceu a senha?
                  </Link>
                </Box>

                {/* Botão de login */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 3,
                    mb: 2,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      Entrando...
                    </Box>
                  ) : (
                    'Entrar'
                  )}
                </Button>

                {/* Divider */}
                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    OU
                  </Typography>
                </Divider>

                {/* Link para cadastro */}
                {/* <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Não tem uma conta?{' '}
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => setRegisterModalOpen(true)}
                      sx={{
                        color: 'primary.main',
                        fontWeight: 600,
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Cadastre-se
                    </Link>
                  </Typography>
                </Box> */}
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>

      {/* Modal de Esqueci a Senha */}
      <Dialog 
        open={forgotPasswordModalOpen} 
        onClose={() => {
          setForgotPasswordModalOpen(false);
          setForgotPasswordEmail('');
          setForgotPasswordMessage({ type: '', text: '' });
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          Recuperar Senha
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
            Digite seu email para receber as instruções de recuperação de senha
          </Typography>
          
          {/* Mensagem de erro/sucesso dentro do modal */}
          {forgotPasswordMessage.text && (
            <Alert 
              severity={forgotPasswordMessage.type === 'error' ? 'error' : 'success'} 
              sx={{ mb: 2 }}
            >
              {forgotPasswordMessage.text}
            </Alert>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={forgotPasswordEmail}
            onChange={(e) => {
              setForgotPasswordEmail(e.target.value);
              // Limpar mensagem quando usuário começar a digitar
              if (forgotPasswordMessage.text) {
                setForgotPasswordMessage({ type: '', text: '' });
              }
            }}
            error={forgotPasswordEmail && !/\S+@\S+\.\S+/.test(forgotPasswordEmail)}
            helperText={
              forgotPasswordEmail && !/\S+@\S+\.\S+/.test(forgotPasswordEmail) 
                ? 'Digite um email válido' 
                : ''
            }
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
              setForgotPasswordModalOpen(false);
              setForgotPasswordEmail('');
              setForgotPasswordMessage({ type: '', text: '' });
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
            onClick={handleForgotPassword}
            variant="contained"
            disabled={forgotPasswordLoading || !forgotPasswordEmail.trim()}
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
            {forgotPasswordLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Enviar'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Redefinir Senha */}
      <Dialog 
        open={resetPasswordModalOpen} 
        onClose={() => {
          setResetPasswordModalOpen(false);
          setResetPasswordData({ token: '', novaSenha: '', confirmPassword: '' });
          setResetPasswordMessage({ type: '', text: '' });
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          Redefinir Senha
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
            Digite o token recebido por email e sua nova senha
          </Typography>
          
          {/* Mensagem de erro/sucesso dentro do modal */}
          {resetPasswordMessage.text && (
            <Alert 
              severity={resetPasswordMessage.type === 'error' ? 'error' : 'success'} 
              sx={{ mb: 2 }}
            >
              {resetPasswordMessage.text}
            </Alert>
          )}
          
          {/* Campo Token */}
          <TextField
            autoFocus
            margin="dense"
            label="Token"
            type="text"
            fullWidth
            variant="outlined"
            value={resetPasswordData.token}
            onChange={(e) => {
              setResetPasswordData(prev => ({ ...prev, token: e.target.value }));
              // Limpar mensagem quando usuário começar a digitar
              if (resetPasswordMessage.text) {
                setResetPasswordMessage({ type: '', text: '' });
              }
            }}
            placeholder="Cole aqui o token recebido por email"
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
            value={resetPasswordData.novaSenha}
            onChange={(e) => {
              setResetPasswordData(prev => ({ ...prev, novaSenha: e.target.value }));
              if (resetPasswordMessage.text) {
                setResetPasswordMessage({ type: '', text: '' });
              }
            }}
            InputProps={{
              endAdornment: (
                <Button
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  sx={{ minWidth: 'auto', p: 1 }}
                >
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </Button>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
              mb: 2
            }}
          />

          {/* Campo Confirmar Senha */}
          <TextField
            margin="dense"
            label="Confirmar Nova Senha"
            type={showConfirmPassword ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={resetPasswordData.confirmPassword}
            onChange={(e) => {
              setResetPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }));
              if (resetPasswordMessage.text) {
                setResetPasswordMessage({ type: '', text: '' });
              }
            }}
            error={resetPasswordData.confirmPassword && resetPasswordData.novaSenha !== resetPasswordData.confirmPassword}
            helperText={
              resetPasswordData.confirmPassword && resetPasswordData.novaSenha !== resetPasswordData.confirmPassword
                ? 'As senhas não coincidem' 
                : ''
            }
            InputProps={{
              endAdornment: (
                <Button
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  sx={{ minWidth: 'auto', p: 1 }}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </Button>
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
              setResetPasswordModalOpen(false);
              setResetPasswordData({ token: '', novaSenha: '', confirmPassword: '' });
              setResetPasswordMessage({ type: '', text: '' });
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
            onClick={handleResetPassword}
            variant="contained"
            disabled={
              resetPasswordLoading || 
              !resetPasswordData.token.trim() || 
              !resetPasswordData.novaSenha || 
              !resetPasswordData.confirmPassword ||
              resetPasswordData.novaSenha !== resetPasswordData.confirmPassword
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
            {resetPasswordLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Redefinir Senha'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Registro */}
      <RegisterModal
        open={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSuccess={(userData) => {
          console.log('Usuário cadastrado com sucesso:', userData);
          setMessage({
            type: 'success',
            text: 'Cadastro realizado com sucesso! Você já pode fazer login.'
          });
        }}
      />
    </ThemeProvider>
  );
};

export default Login;