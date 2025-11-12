# Configuração para Deploy no Vercel

## Problema de CORS Resolvido

Este projeto inclui configurações para resolver problemas de CORS em produção no Vercel.

## Arquivos de Configuração

### 1. `vercel.json`
- Configura proxy para a API externa
- Adiciona headers CORS necessários
- Redireciona `/api/*` para `https://supply.i4app.com.br/api/*`

### 2. `.env.production`
- Configura `VITE_API_BASE_URL=/api` para usar o proxy do Vercel
- Usado automaticamente em builds de produção

### 3. Fallback no AuthService
- Se o proxy falhar, tenta fazer requisição direta com fetch
- Implementa dupla estratégia para garantir funcionamento

## Deploy no Vercel

1. **Push para o repositório**
   ```bash
   git add .
   git commit -m "Configure CORS for production"
   git push origin main
   ```

2. **Deploy automático**
   - O Vercel detectará as mudanças e fará deploy automaticamente
   - O `vercel.json` será aplicado automaticamente

## Testando em Produção

1. **Verificar logs do Vercel**
   - Acesse Functions tab no dashboard do Vercel
   - Verifique se as requisições estão sendo proxy corretamente

2. **Verificar no navegador**
   - Abra DevTools > Network
   - Tente fazer login
   - Verifique se as requisições vão para `/api/v1/auth/login`

## Alternativas se o Proxy não Funcionar

Se o proxy do Vercel não resolver completamente:

### Opção 1: API Gateway
Criar um middleware simples no Vercel:

```javascript
// api/proxy.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  
  const apiResponse = await fetch(\`https://supply.i4app.com.br/api\${req.url}\`, {
    method: req.method,
    headers: req.headers,
    body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
  })
  
  const data = await apiResponse.json()
  res.status(apiResponse.status).json(data)
}
```

### Opção 2: Backend Próprio
- Criar um backend simples (Express.js) no Vercel
- Fazer proxy das requisições para a API original
- Configurar CORS adequadamente

## Variáveis de Ambiente no Vercel

Configure no dashboard do Vercel:

- `VITE_API_BASE_URL`: `/api` (para usar proxy)
- `VITE_API_TIMEOUT`: `10000`
- `VITE_NODE_ENV`: `production`

## Comandos Úteis

```bash
# Testar build local
npm run build
npm run preview

# Deploy manual (se necessário)
npx vercel --prod
```