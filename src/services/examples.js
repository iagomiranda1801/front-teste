// Exemplo de como usar os services

import { authService } from '../services';

// Exemplo 1: Login
const handleLogin = async () => {
  const result = await authService.login({
    email: 'iagomarinst@gmail.com',
    password: '123456'
  });

  if (result.success) {
    console.log('Login bem-sucedido:', result.data);
    // Redirecionar ou atualizar estado
  } else {
    console.log('Erro no login:', result.message);
    // Mostrar mensagem de erro
  }
};

// Exemplo 2: Verificar se está autenticado
const isLoggedIn = authService.isAuthenticated();
console.log('Usuário logado:', isLoggedIn);

// Exemplo 3: Obter dados do usuário
const userData = authService.getUserData();
console.log('Dados do usuário:', userData);

// Exemplo 4: Logout
const handleLogout = async () => {
  const result = await authService.logout();
  console.log('Logout:', result.message);
};

// Exemplo 5: Registrar usuário
const handleRegister = async () => {
  const result = await authService.register({
    name: 'João Silva',
    email: 'joao@email.com',
    password: '123456'
  });

  if (result.success) {
    console.log('Registro bem-sucedido:', result.data);
  } else {
    console.log('Erro no registro:', result.message);
  }
};

export {
  handleLogin,
  handleLogout,
  handleRegister,
  isLoggedIn,
  userData
};