import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Snackbar,
  Grid,
  CardContent,
  CardActions,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { quoteService, QuoteStatus, QUOTE_STATUS_INFO } from '../services/quoteService';
import { useAuth } from '../hooks/useAuth';
import { format, isValid, parseISO } from 'date-fns';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { userService } from '../services/userService';

const MotionBox = motion.div;

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const getStatusColor = (status: QuoteStatus) => {
  switch (status) {
    case 'enviado':
      return 'primary';
    case 'negociacao':
      return 'warning';
    case 'fechado':
      return 'success';
    case 'perdido':
      return 'error';
    default:
      return 'default';
  }
};

const formatDate = (dateString: string | number | Date | null | undefined) => {
  if (!dateString) return 'Data não disponível';
  const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
  return isValid(date) ? format(date, 'dd/MM/yyyy') : 'Data inválida';
};

export default function QuoteList() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { currentUser, isAdmin } = useAuth();

  const [quotes, setQuotes] = useState<any[]>([]);
  const [transferredQuotes, setTransferredQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState(0);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (currentUser) {
      fetchQuotes();
      fetchTransferredQuotes();
      fetchUserNames();
    }
  }, [currentUser]);

  const fetchQuotes = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await quoteService.getAll(currentUser.uid, isAdmin);
      setQuotes(data);
    } catch (error) {
      console.error('Erro ao buscar cotações:', error);
      setError('Erro ao carregar cotações');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransferredQuotes = async () => {
    if (!currentUser) return;
    try {
      const data = await quoteService.getTransferredQuotes(currentUser.uid, isAdmin);
      setTransferredQuotes(data);
    } catch (error) {
      console.error('Erro ao buscar cotações transferidas:', error);
    }
  };

  const fetchUserNames = async () => {
    try {
      const users = await userService.getAll();
      const userMap = users.reduce((acc, user) => {
        acc[user.id!] = user.name;
        return acc;
      }, {} as Record<string, string>);
      setUserNames(userMap);
    } catch (error) {
      console.error('Erro ao buscar nomes dos usuários:', error);
    }
  };

  const getUserName = (userId: string) => {
    return userNames[userId] || 'Usuário não encontrado';
  };

  const handleViewQuote = (quoteId: string, createdBy: string) => {
    if (isAdmin || createdBy === currentUser?.uid) {
      navigate(`/orcamentos/${quoteId}`);
    } else {
      setSnackbarMessage('Você não tem permissão para visualizar esta cotação.');
    }
  };

  const handleEditQuote = (quoteId: string, createdBy: string) => {
    if (isAdmin || createdBy === currentUser?.uid) {
      navigate(`/orcamentos/${quoteId}/editar`);
    } else {
      setSnackbarMessage('Você não tem permissão para editar esta cotação.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!currentUser) {
        setSnackbarMessage('Você precisa estar logado para excluir uma cotação');
        return;
      }
      await quoteService.delete(id, currentUser.uid, isAdmin);
      setSnackbarMessage('Cotação excluída com sucesso');
      fetchQuotes();
      fetchTransferredQuotes();
    } catch (error: any) {
      console.error('Erro ao excluir cotação:', error);
      setSnackbarMessage(error.message || 'Erro ao excluir cotação');
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    // Filtro por texto (cliente ou número)
    const matchesSearch = 
      quote.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por status
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const renderTransferInfo = (quote: any) => {
    if (!quote.transferHistory || quote.transferHistory.length === 0) return null;

    const lastTransfer = quote.transferHistory[quote.transferHistory.length - 1];
    return (
      <Box mt={2}>
        <Stack spacing={1}>
          <Typography variant="subtitle2" color="text.secondary" component="div">
            Última transferência: {formatDate(lastTransfer.date)}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary" component="div">
              De:
            </Typography>
            <Chip
              size="small"
              label={getUserName(lastTransfer.fromUserId)}
              variant="outlined"
            />
            <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Chip
              size="small"
              label={getUserName(lastTransfer.toUserId)}
              variant="outlined"
            />
          </Box>
        </Stack>
      </Box>
    );
  };

  const renderQuoteCard = (quote: any, isTransferred: boolean = false) => (
    <Card key={quote.id} sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" component="div">
              {quote.clientName || 'Cliente não especificado'}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={1}>
              <Chip
                label={QUOTE_STATUS_INFO[quote.status]?.label}
                color={getStatusColor(quote.status)}
                size="small"
              />
              {isAdmin && quote.sellerName && (
                <Chip
                  icon={<PersonIcon />}
                  label={quote.sellerName}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1} alignItems={{ xs: 'flex-start', sm: 'flex-end' }}>
              <Typography>
                Data: {formatDate(quote.date)}
              </Typography>
              <Typography variant="h6" color="primary">
                {formatCurrency(quote.total || 0)}
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        {isTransferred && renderTransferInfo(quote)}
      </CardContent>
      <CardActions>
        <Button
          size="small"
          startIcon={<ViewIcon />}
          onClick={() => handleViewQuote(quote.id, quote.createdBy)}
        >
          Visualizar
        </Button>
        {(isAdmin || quote.createdBy === currentUser?.uid) && (
          <>
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => handleEditQuote(quote.id, quote.createdBy)}
            >
              Editar
            </Button>
            <Button
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => handleDelete(quote.id)}
            >
              Excluir
            </Button>
          </>
        )}
      </CardActions>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Orçamentos
          </Typography>

          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
            <Tab label="Todos" />
            <Tab label="Transferidos" />
          </Tabs>

          {activeTab === 0 && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/orcamentos/novo')}
                >
                  Novo Orçamento
                </Button>
              </Box>

              <Card sx={{ mb: 4, p: 2 }}>
                <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} alignItems="stretch">
                  <TextField
                    fullWidth
                    label="Buscar"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Status"
                      onChange={(e) => setStatusFilter(e.target.value as QuoteStatus | 'all')}
                    >
                      <MenuItem value="all">Todos</MenuItem>
                      <MenuItem value="enviado">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label="Enviado" 
                            size="small" 
                            color="primary"
                            sx={{ minWidth: 100 }}
                          />
                        </Box>
                      </MenuItem>
                      <MenuItem value="negociacao">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label="Em Negociação" 
                            size="small" 
                            color="warning"
                            sx={{ minWidth: 100 }}
                          />
                        </Box>
                      </MenuItem>
                      <MenuItem value="fechado">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label="Fechado" 
                            size="small" 
                            color="success"
                            sx={{ minWidth: 100 }}
                          />
                        </Box>
                      </MenuItem>
                      <MenuItem value="perdido">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label="Perdido" 
                            size="small" 
                            color="error"
                            sx={{ minWidth: 100 }}
                          />
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Card>

              {filteredQuotes.map(quote => renderQuoteCard(quote))}

              {filteredQuotes.length === 0 && (
                <Box textAlign="center" mt={4}>
                  <Typography variant="h6" color="text.secondary">
                    Nenhuma cotação encontrada
                  </Typography>
                </Box>
              )}
            </>
          )}

          {activeTab === 1 && (
            <>
              {transferredQuotes.map(quote => renderQuoteCard(quote, true))}

              {transferredQuotes.length === 0 && (
                <Box textAlign="center" mt={4}>
                  <Typography variant="h6" color="text.secondary">
                    Nenhuma cotação transferida encontrada
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>

        <Snackbar
          open={!!snackbarMessage}
          autoHideDuration={6000}
          onClose={() => setSnackbarMessage('')}
          message={snackbarMessage}
        />
      </MotionBox>
    </Box>
  );
}
