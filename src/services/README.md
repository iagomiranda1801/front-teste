# Services - Documentação

Esta pasta contém todos os services para comunicação com a API.

## Estrutura

```
src/services/
├── api.js              # Configuração base do axios
├── authService.js      # Service de autenticação
├── index.js           # Exportações centralizadas
├── examples.js        # Exemplos de uso
└── README.md          # Esta documentação
```

## Configuração

### Variáveis de Ambiente (.env.local)

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=10000
VITE_NODE_ENV=development
```

## Como Usar

### 1. AuthService

```javascript
import { authService } from './services';

// Login
const result = await authService.login({
  email: 'iagomarinst@gmail.com',
  password: '123456'
});

if (result.success) {
  console.log('Token:', authService.getToken());
  console.log('Usuário:', authService.getUserData());
}
```

### 2. API Direta

```javascript
import { api } from './services';

// Requisição personalizada
const response = await api.get('/users');
const users = response.data;
```

## Endpoints Configurados

### Auth
- `POST /auth/login/user` - Login
- `POST /auth/logout` - Logout
- `POST /auth/register` - Registro
- `POST /auth/forgot-password` - Esqueci a senha

## Funcionalidades

### ✅ Interceptors
- Adiciona token automaticamente nas requisições
- Log de requisições/respostas em desenvolvimento
- Tratamento de erros globais
- Redirecionamento automático em caso de 401

### ✅ Armazenamento Local
- Token salvo automaticamente no localStorage
- Dados do usuário salvos automaticamente
- Verificação de autenticação

### ✅ Tratamento de Erros
- Mensagens de erro padronizadas
- Fallbacks para erros de rede
- Logs detalhados para debug

## Exemplos de Resposta da API

### Login Bem-sucedido
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "name": "Iago",
    "email": "iagomarinst@gmail.com"
  },
  "message": "Login realizado com sucesso!"
}
```

### Erro de Login
```json
{
  "success": false,
  "message": "Email ou senha incorretos",
  "error": "INVALID_CREDENTIALS"
}
```