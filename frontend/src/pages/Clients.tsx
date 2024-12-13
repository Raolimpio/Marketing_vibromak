import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Grid,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  useTheme,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { clientService } from '../services/clientService';
import { Client } from '../types/Client';

const MotionCard = motion(Card);

const formatDate = (date: Date | null): string => {
  if (!date) return 'Não disponível';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

export default function Clients() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadClients();
  }, [refreshKey]);

  useEffect(() => {
    filterClients();
  }, [searchTerm, clients]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAll();
      setClients(data);
      setError('');
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setError('Não foi possível carregar os clientes. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
    );
    setFilteredClients(filtered);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'success',
      inactive: 'error',
      pending: 'warning',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts = {
      active: 'Ativo',
      inactive: 'Inativo',
      pending: 'Pendente',
    };
    return texts[status as keyof typeof texts] || status;
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4
      }}>
        <Typography variant="h4" component="h1" sx={{ 
          fontWeight: 'bold',
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Clientes
        </Typography>

        <Box>
          <Tooltip title="Atualizar lista">
            <IconButton onClick={handleRefresh} sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/clientes/novo')}
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              boxShadow: theme.shadows[1],
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4],
              }
            }}
          >
            Novo Cliente
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nome, email ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ bgcolor: 'background.paper' }}
        />
      </Card>

      <Grid container spacing={2}>
        {filteredClients.length === 0 ? (
          <Grid item xs={12}>
            <Card sx={{ 
              textAlign: 'center', 
              py: 8,
              background: theme.palette.action.hover,
              border: `2px dashed ${theme.palette.divider}`
            }}>
              <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
              </Typography>
              <Typography variant="body2" color="text.disabled">
                {searchTerm ? 'Tente buscar com outros termos' : 'Clique em "Novo Cliente" para começar'}
              </Typography>
            </Card>
          </Grid>
        ) : (
          <AnimatePresence>
            {filteredClients.map((client, index) => (
              <Grid item xs={12} sm={6} md={4} key={client.id}>
                <MotionCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    },
                    transition: 'all 0.3s ease-in-out',
                  }}
                  onClick={() => navigate(`/clientes/${client.id}`)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      <Typography variant="h6" noWrap>
                        {client.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={getStatusText(client.status)}
                      color={getStatusColor(client.status)}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {client.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {client.phone}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 2,
                    pt: 2,
                    borderTop: `1px solid ${theme.palette.divider}`
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      Criado em: {formatDate(client.createdAt)}
                    </Typography>
                    <NavigateNextIcon color="action" />
                  </Box>
                </MotionCard>
              </Grid>
            ))}
          </AnimatePresence>
        )}
      </Grid>
    </Box>
  );
}
