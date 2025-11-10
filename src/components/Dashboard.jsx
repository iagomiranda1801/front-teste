import { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  AccountCircle,
  ExitToApp,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { authService } from '../services';
import UserManagement from './UserManagement';
import FuncionarioManagement from './FuncionarioManagement';
import ClientProfile from './ClientProfile';
import DashboardHome from './DashboardHome';

const drawerWidth = 280;

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
      default: '#f8f9fa',
    },
  },
  shape: {
    borderRadius: 12,
  },
});

const Dashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('users');
  const [anchorEl, setAnchorEl] = useState(null);
  const [userData, setUserData] = useState(null);
  
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  useEffect(() => {
    // Obter dados do usuário logado
    const user = authService.getUserData();
    setUserData(user);
    
    // Definir menu inicial baseado no tipo de usuário
    if (user?.type === 'client') {
      setSelectedMenu('profile');
    } else {
      setSelectedMenu('dashboard');
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/';
  };

  // Menu items baseado no tipo de usuário
  const getMenuItems = () => {
    if (userData?.type === 'client') {
      return [
        {
          id: 'profile',
          text: 'Meu Perfil',
          icon: <PeopleIcon />,
          component: <ClientProfile />
        },
      ];
    }

    // Menu para admin
    return [
      {
        id: 'dashboard',
        text: 'Dashboard',
        icon: <HomeIcon />,
        component: <DashboardHome />
      },
      {
        id: 'users',
        text: 'Usuários',
        icon: <PeopleIcon />,
        component: <UserManagement />
      },
      {
        id: 'funcionarios',
        text: 'Funcionários',
        icon: <BusinessIcon />,
        component: <FuncionarioManagement />
      },
    ];
  };

  const menuItems = getMenuItems();

  const drawer = (
    <div>
      {/* Logo/Header do menu */}
      <Box
        sx={{
          p: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <DashboardIcon />
        <Typography variant="h6" noWrap component="div">
          {userData?.type === 'client' ? 'Painel do Cliente' : 'Dashboard'}
        </Typography>
      </Box>

      <Divider />

      {/* Menu Items */}
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={selectedMenu === item.id}
              onClick={() => {
                setSelectedMenu(item.id);
                if (isMobile) {
                  setMobileOpen(false);
                }
              }}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  borderRight: '3px solid #667eea',
                },
              }}
            >
              <ListItemIcon sx={{ color: selectedMenu === item.id ? '#667eea' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  const renderContent = () => {
    const selectedItem = menuItems.find(item => item.id === selectedMenu);
    return selectedItem ? selectedItem.component : <div>Selecione um item do menu</div>;
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        {/* AppBar */}
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              {menuItems.find(item => item.id === selectedMenu)?.text || 'Dashboard'}
            </Typography>

            {/* User Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Olá, {userData?.name || 'Usuário'}
              </Typography>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    fontSize: '14px',
                  }}
                >
                  {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* User Menu Dropdown */}
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
        >
          <MenuItem onClick={handleProfileMenuClose}>
            <ListItemIcon>
              <AccountCircle fontSize="small" />
            </ListItemIcon>
            Perfil
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <ExitToApp fontSize="small" />
            </ListItemIcon>
            Sair
          </MenuItem>
        </Menu>

        {/* Drawer */}
        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
          {/* Mobile drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
          
          {/* Desktop drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { md: `calc(100% - ${drawerWidth}px)` },
            mt: '64px', // AppBar height
            minHeight: 'calc(100vh - 64px)',
            backgroundColor: 'background.default',
          }}
        >
          {renderContent()}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;