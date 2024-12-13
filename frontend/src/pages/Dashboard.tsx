import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  CircularProgress, 
  Alert, 
  Card, 
  CardContent, 
  IconButton, 
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptBR from 'date-fns/locale/pt-BR';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../contexts/AuthContext';
import { statisticsService, Statistics, UserStatistics, Quote } from '../services/statisticsService';
import { startOfDay, endOfDay } from 'date-fns';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  borderRadius: '16px',
  boxShadow: theme.shadows[1],
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[4],
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  marginBottom: theme.spacing(2),
}));

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}

const calculateTotalValue = (quotes: Quote[] | undefined | null) => {
  if (!quotes || !Array.isArray(quotes)) return 0;
  return quotes.reduce((acc, quote) => acc + quote.total, 0);
};

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const theme = useTheme();
  
  return (
    <StyledCard>
      <CardContent>
        <IconWrapper sx={{ bgcolor: theme.palette[color].light }}>
          {React.cloneElement(icon as React.ReactElement, { 
            sx: { color: theme.palette[color].main, fontSize: 24 } 
          })}
        </IconWrapper>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="h4">
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total: {formatCurrency(calculateTotalValue([]))}
          </Typography>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default function Dashboard() {
  const theme = useTheme();
  const [allStatistics, setAllStatistics] = useState<UserStatistics[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { currentUser, isAdmin } = useAuth();

  useEffect(() => {
    if (currentUser?.uid) {
      loadDashboardData();
      if (isAdmin) {
        loadUsers();
      }
    }
  }, [currentUser, startDate, endDate, selectedUserId]);

  const loadUsers = async () => {
    try {
      const usersData = await statisticsService.getAll();
      setAllStatistics(usersData);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    }
  };

  const loadDashboardData = async () => {
    if (!currentUser?.uid) return;
    
    try {
      setLoading(true);
      setRefreshing(true);
      let stats: Statistics;
      
      // Ajustar as datas para início e fim do dia
      const adjustedStartDate = startDate ? startOfDay(startDate) : undefined;
      const adjustedEndDate = endDate ? endOfDay(endDate) : undefined;
      
      if (isAdmin && selectedUserId === 'all') {
        stats = await statisticsService.getAllUsersStats(adjustedStartDate, adjustedEndDate);
      } else {
        const userId = selectedUserId === 'all' ? currentUser.uid : selectedUserId;
        stats = await statisticsService.getUserStats(userId, adjustedStartDate, adjustedEndDate);
      }

      // Atualiza as estatísticas no estado
      const userStats = {
        ...stats,
        userId: selectedUserId === 'all' ? currentUser.uid : selectedUserId,
        userName: selectedUserId === 'all' ? currentUser.displayName || 'Usuário' : allStatistics.find(s => s.userId === selectedUserId)?.userName || 'Usuário'
      };
      
      setAllStatistics(prev => {
        const userIndex = prev.findIndex(s => s.userId === userStats.userId);
        if (userIndex > -1) {
          // Atualiza as estatísticas se o usuário já existe
          return prev.map((s, index) => index === userIndex ? userStats : s);
        } else {
          // Adiciona as estatísticas se o usuário não existe
          return [...prev, userStats];
        }
      });
      
      setError('');
    } catch (err: any) {
      console.error('Erro ao carregar dados do dashboard:', err);
      // Exibe uma mensagem mais amigável se o erro for relacionado ao índice
      const errorMessage = err.message?.includes('índice no Firestore') 
        ? err.message 
        : 'Não foi possível carregar os dados. Tente novamente mais tarde.';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getDisplayStatistics = () => {
    console.log('getDisplayStatistics - allStatistics:', allStatistics);
    
    const defaultStats = {
      openQuotes: [],
      negotiatingQuotes: [],
      lostQuotes: [],
      closedQuotes: []
    };

    if (allStatistics.length === 0) {
      console.log('Sem estatísticas disponíveis');
      return defaultStats;
    }

    if (selectedUserId === 'all' && isAdmin) {
      // Concatena os arrays de orçamentos de todos os usuários
      const stats = {
        openQuotes: allStatistics.reduce((acc, stat) => [...acc, ...(stat.openQuotes || [])], [] as Quote[]),
        negotiatingQuotes: allStatistics.reduce((acc, stat) => [...acc, ...(stat.negotiatingQuotes || [])], [] as Quote[]),
        lostQuotes: allStatistics.reduce((acc, stat) => [...acc, ...(stat.lostQuotes || [])], [] as Quote[]),
        closedQuotes: allStatistics.reduce((acc, stat) => [...acc, ...(stat.closedQuotes || [])], [] as Quote[])
      };
      console.log('Estatísticas totais:', stats);
      return stats;
    }

    const userStats = allStatistics.find(stat => 
      stat.userId === (selectedUserId === 'all' ? currentUser?.uid : selectedUserId)
    );
    
    console.log('Estatísticas do usuário:', userStats);
    return userStats || defaultStats;
  };

  const renderStatCard = (
    title: string,
    quotes: Quote[] | undefined | null,
    icon: React.ReactNode,
    color: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
  ) => {
    const safeQuotes = quotes || [];
    const totalValue = calculateTotalValue(quotes);
    return (
      <StyledCard>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="h4" color={`${color}.main`}>
              {safeQuotes.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total: {formatCurrency(totalValue)}
            </Typography>
          </Box>
          <Box sx={{ position: 'absolute', top: 8, right: 8, opacity: 0.2 }}>
            {icon}
          </Box>
        </CardContent>
      </StyledCard>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  const statistics = getDisplayStatistics();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <DatePicker
              label="Data Inicial"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              slotProps={{ textField: { size: 'small' } }}
            />
            <DatePicker
              label="Data Final"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              slotProps={{ textField: { size: 'small' } }}
            />
          </LocalizationProvider>
          
          {isAdmin && (
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="user-select-label">Usuário</InputLabel>
              <Select
                labelId="user-select-label"
                size="small"
                value={selectedUserId}
                label="Usuário"
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <MenuItem key="all" value="all">Todos os usuários</MenuItem>
                {allStatistics.map((user) => (
                  <MenuItem key={user.userId} value={user.userId}>
                    {user.userName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Tooltip title="Atualizar dados">
            <IconButton 
              onClick={loadDashboardData}
              disabled={refreshing}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid key="open" item xs={12} sm={6} md={3}>
          {renderStatCard(
            'Orçamentos Enviados',
            statistics.openQuotes,
            <AssignmentIcon />,
            'info'
          )}
        </Grid>

        <Grid key="negotiating" item xs={12} sm={6} md={3}>
          {renderStatCard(
            'Em Negociação',
            statistics.negotiatingQuotes,
            <BusinessCenterIcon />,
            'warning'
          )}
        </Grid>

        <Grid key="closed" item xs={12} sm={6} md={3}>
          {renderStatCard(
            'Orçamentos Fechados',
            statistics.closedQuotes,
            <CheckCircleIcon />,
            'success'
          )}
        </Grid>

        <Grid key="lost" item xs={12} sm={6} md={3}>
          {renderStatCard(
            'Orçamentos Perdidos',
            statistics.lostQuotes,
            <CancelIcon />,
            'error'
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
