import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { authService, dashboardService, funcionarioService } from '../services';

const DashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [recentAccess, setRecentAccess] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const user = authService.getUserData();
    setUserData(user);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, accessData, funcionariosStats] = await Promise.all([
        dashboardService.getSystemStats(),
        dashboardService.getRecentAccess(5),
        funcionarioService.getEstatisticas().catch(() => ({ success: false, data: null }))
      ]);
      
      // Combinar estatísticas do sistema com as de funcionários
      const combinedStats = {
        ...statsData,
        funcionarios: funcionariosStats.success ? funcionariosStats.data : null
      };
      
      setStats(combinedStats);
      setRecentAccess(accessData);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setMessage('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getDeviceIcon = (device) => {
    if (device.includes('Chrome')) return '🌐';
    if (device.includes('Safari')) return '🦄';
    if (device.includes('Firefox')) return '🦊';
    return '💻';
  };

  const StatWidget = ({ title, value, icon, color = 'primary' }) => (
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {title}
            </Typography>
          </Box>
          <Box sx={{ opacity: 0.3, fontSize: 48 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Carregando dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {message && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setMessage('')}
        >
          {message}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bem-vindo, {userData?.name}! Aqui está um resumo do sistema.
          </Typography>
        </Box>
        <IconButton onClick={loadDashboardData} title="Atualizar dados">
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Widgets de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatWidget
            title="Total de Usuários"
            value={stats?.totalUsers || 0}
            icon={<PeopleIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatWidget
            title="Funcionários Ativos"
            value={stats?.funcionarios?.totalAtivos || 0}
            icon={<BusinessIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatWidget
            title="Receita Mensal"
            value={stats?.monthlyRevenue || 'R$ 0,00'}
            icon={<TrendingUpIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatWidget
            title="Total Geral"
            value={((stats?.totalUsers || 0) + (stats?.funcionarios?.totalAtivos || 0))}
            icon={<PeopleIcon />}
            color="primary"
          />
        </Grid>
      </Grid>

      {/* Tabela de Últimos Acessos */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              Últimos Acessos
            </Typography>
          </Box>

          {isMobile ? (
            // Layout para mobile
            <Box>
              {recentAccess.map((access) => (
                <Paper 
                  key={access.id} 
                  sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'grey.200' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: 'primary.main' }}>
                      {access.user.charAt(0)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {access.user}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {access.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Último acesso:</strong> {formatDateTime(access.lastAccess)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>IP:</strong> {access.ip}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{getDeviceIcon(access.device)}</span>
                    <Typography variant="body2" color="text.secondary">
                      {access.device}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            // Tabela para desktop
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Usuário</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Último Acesso</strong></TableCell>
                    <TableCell><strong>IP</strong></TableCell>
                    <TableCell><strong>Dispositivo</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentAccess.map((access) => (
                    <TableRow key={access.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: 'primary.main' }}>
                            {access.user.charAt(0)}
                          </Avatar>
                          <Typography variant="subtitle2">
                            {access.user}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{access.email}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(access.lastAccess)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={access.ip} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{getDeviceIcon(access.device)}</span>
                          <Typography variant="body2">
                            {access.device}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardHome;