import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  CircularProgress, 
  Alert, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import { statisticsService, UserStatistics } from '../../services/statisticsService';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import InventoryIcon from '@mui/icons-material/Inventory';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <Paper sx={{ p: 2, height: '100%' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      {icon}
      <Typography variant="h6" sx={{ ml: 1 }}>
        {title}
      </Typography>
    </Box>
    <Typography variant="h4">
      {value}
    </Typography>
  </Paper>
);

const AdminDashboard: React.FC = () => {
  const [allStatistics, setAllStatistics] = useState<UserStatistics[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await statisticsService.getAll();
        setAllStatistics(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err: any) {
        console.error('Erro ao buscar estatísticas:', err);
        setError(err.message || 'Erro ao buscar estatísticas.');
        setAllStatistics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  const getDisplayStatistics = () => {
    if (!Array.isArray(allStatistics) || allStatistics.length === 0) {
      return {
        totalSales: 0,
        totalProducts: 0,
        pendingQuotes: 0,
        approvedQuotes: 0
      };
    }

    if (selectedUserId === 'all') {
      return {
        totalSales: allStatistics.reduce((sum, stat) => sum + (stat.totalSales || 0), 0),
        totalProducts: allStatistics.reduce((sum, stat) => sum + (stat.totalProducts || 0), 0),
        pendingQuotes: allStatistics.reduce((sum, stat) => sum + (stat.pendingQuotes || 0), 0),
        approvedQuotes: allStatistics.reduce((sum, stat) => sum + (stat.approvedQuotes || 0), 0)
      };
    }

    const userStats = allStatistics.find(stat => stat.userId === selectedUserId);
    return userStats || {
      totalSales: 0,
      totalProducts: 0,
      pendingQuotes: 0,
      approvedQuotes: 0
    };
  };

  const statistics = getDisplayStatistics();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const renderGeneralReport = () => (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Usuário</TableCell>
            <TableCell align="right">Vendas Totais</TableCell>
            <TableCell align="right">Produtos</TableCell>
            <TableCell align="right">Cotações Pendentes</TableCell>
            <TableCell align="right">Cotações Aprovadas</TableCell>
            <TableCell align="right">Taxa de Aprovação</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allStatistics.map((stat) => (
            <TableRow key={stat.userId}>
              <TableCell>{stat.userName || stat.userId}</TableCell>
              <TableCell align="right">{statisticsService.formatCurrency(stat.totalSales || 0)}</TableCell>
              <TableCell align="right">{stat.totalProducts}</TableCell>
              <TableCell align="right">{stat.pendingQuotes}</TableCell>
              <TableCell align="right">{stat.approvedQuotes}</TableCell>
              <TableCell align="right">
                {stat.approvedQuotes + stat.pendingQuotes > 0
                  ? `${((stat.approvedQuotes / (stat.approvedQuotes + stat.pendingQuotes)) * 100).toFixed(1)}%`
                  : '0%'}
              </TableCell>
            </TableRow>
          ))}
          <TableRow sx={{ backgroundColor: (theme) => theme.palette.action.hover }}>
            <TableCell><strong>Total</strong></TableCell>
            <TableCell align="right"><strong>{statisticsService.formatCurrency(statistics.totalSales)}</strong></TableCell>
            <TableCell align="right"><strong>{statistics.totalProducts}</strong></TableCell>
            <TableCell align="right"><strong>{statistics.pendingQuotes}</strong></TableCell>
            <TableCell align="right"><strong>{statistics.approvedQuotes}</strong></TableCell>
            <TableCell align="right"><strong>
              {statistics.approvedQuotes + statistics.pendingQuotes > 0
                ? `${((statistics.approvedQuotes / (statistics.approvedQuotes + statistics.pendingQuotes)) * 100).toFixed(1)}%`
                : '0%'}
            </strong></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Painel de Administração
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Visão Geral" />
        <Tab label="Relatório Detalhado" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="user-select-label">Filtrar por Usuário</InputLabel>
            <Select
              labelId="user-select-label"
              value={selectedUserId}
              label="Filtrar por Usuário"
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <MenuItem value="all">Todos os Usuários</MenuItem>
              {allStatistics.map((stat) => (
                <MenuItem key={stat.userId} value={stat.userId}>
                  {stat.userName || stat.userId}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Vendas Totais"
              value={statisticsService.formatCurrency(statistics.totalSales)}
              icon={<MonetizationOnIcon color="primary" sx={{ fontSize: 32 }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Produtos"
              value={statistics.totalProducts}
              icon={<InventoryIcon color="primary" sx={{ fontSize: 32 }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Cotações Pendentes"
              value={statistics.pendingQuotes}
              icon={<DescriptionIcon color="primary" sx={{ fontSize: 32 }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Cotações Aprovadas"
              value={statistics.approvedQuotes}
              icon={<CheckCircleIcon color="primary" sx={{ fontSize: 32 }} />}
            />
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {renderGeneralReport()}
      </TabPanel>
    </Box>
  );
};

export default AdminDashboard;
