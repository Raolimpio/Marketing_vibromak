import { useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tab,
  Tabs,
} from '@mui/material';
import { useState } from 'react';
import Products from '../components/admin/Products';
import Users from '../components/admin/Users';
import Documents from '../components/admin/Documents';
import Settings from '../components/admin/Settings';
import AdminDashboard from '../components/admin/Dashboard';

export default function Admin() {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  if (!userProfile?.isAdmin) {
    return <Navigate to="/" />;
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 0:
        return <AdminDashboard />;
      case 1:
        return <Products />;
      case 2:
        return <Users />;
      case 3:
        return <Documents />;
      case 4:
        return <Settings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom component="h2">
              Painel Administrativo
            </Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="admin tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Estatísticas" />
                <Tab label="Produtos" />
                <Tab label="Usuários" />
                <Tab label="Documentos" />
                <Tab label="Configurações" />
              </Tabs>
            </Box>
            {getTabContent()}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
