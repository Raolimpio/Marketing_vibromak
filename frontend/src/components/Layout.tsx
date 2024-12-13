import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { auth } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useTheme as useCustomTheme } from '../hooks/useTheme';

// Largura do drawer em desktop
const DRAWER_WIDTH = 256;

// Itens do menu com submenus
const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Produtos', icon: <ShoppingCartIcon />, path: '/produtos' },
  { text: 'Clientes', icon: <PeopleIcon />, path: '/clientes' },
  { text: 'Orçamentos', icon: <DescriptionIcon />, path: '/orcamentos' },
  { text: 'Configurações', icon: <SettingsIcon />, path: '/configuracoes' },
];

// Função para calcular se deve usar texto branco ou preto
const shouldUseWhiteText = (backgroundColor: string): boolean => {
  // Remove o # se existir
  const hex = backgroundColor.replace('#', '');
  
  // Converte para RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calcula a luminosidade
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Retorna true para cores escuras (texto branco)
  return luminance < 0.5;
};

const Layout = () => {
  const theme = useTheme();
  const customTheme = useCustomTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<{ [key: string]: boolean }>({});

  // Calcula a cor do texto do menu baseado na cor de fundo
  const menuTextColor = useMemo(() => {
    return shouldUseWhiteText(customTheme.menuColor) ? '#ffffff' : '#000000';
  }, [customTheme.menuColor]);

  // Fecha o drawer móvel quando mudar de rota
  useEffect(() => {
    if (!isDesktop) {
      setMobileOpen(false);
    }
  }, [location.pathname, isDesktop]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      // Limpa qualquer dado local se necessário
      localStorage.removeItem('rememberedEmail');
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, redireciona para login
      navigate('/login');
    }
  };

  const isPathSelected = (menuPath: string) => {
    return location.pathname === menuPath || location.pathname.startsWith(menuPath + '/');
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
  };

  const drawer = (
    <Box sx={{ height: '100%', backgroundColor: customTheme.menuColor, color: menuTextColor }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
        }}
      >
        {customTheme.logo && (
          <Box
            component="img"
            src={customTheme.logo}
            alt="Logo"
            sx={{ height: 40, objectFit: 'contain' }}
          />
        )}
        {!isDesktop && (
          <IconButton onClick={handleDrawerToggle} sx={{ color: menuTextColor }}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      <List sx={{ px: 2 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            onClick={() => handleMenuItemClick(item.path)}
            selected={isPathSelected(item.path)}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              color: menuTextColor,
              '& .MuiListItemIcon-root': {
                color: menuTextColor,
              },
              '&.Mui-selected': {
                backgroundColor: customTheme.menuSelected,
                '&:hover': {
                  backgroundColor: customTheme.menuSelected,
                },
              },
              '&:hover': {
                backgroundColor: customTheme.menuHover,
              },
            }}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}

        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 1,
            mt: 2,
            color: menuTextColor,
            '& .MuiListItemIcon-root': {
              color: menuTextColor,
            },
            '&:hover': {
              backgroundColor: customTheme.menuHover,
            },
          }}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Sair" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backgroundColor: customTheme.menuColor,
          color: menuTextColor,
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="abrir menu"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Menu Lateral */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Versão móvel */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              backgroundColor: customTheme.menuColor,
              color: menuTextColor,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Versão desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              backgroundColor: customTheme.menuColor,
              color: menuTextColor,
              border: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Conteúdo Principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          backgroundColor: customTheme.backgroundColor,
          color: customTheme.textColor,
          pt: { xs: 8, md: 10 },
        }}
      >
        <Container maxWidth="xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Outlet />
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
