import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  useTheme,
  Tooltip,
  Fade,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  NavigateNext as NavigateNextIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { quoteService, Quote, QuoteStatus, QUOTE_STATUS_INFO } from '../services/quoteService';
import { useAuth } from '../hooks/useAuth';

const getStatusColor = (status: QuoteStatus): string => {
  return QUOTE_STATUS_INFO[status].color;
};

const getStatusText = (status: QuoteStatus): string => {
  return QUOTE_STATUS_INFO[status].label;
};

export default function Quotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const theme = useTheme();
  const { currentUser, userProfile, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (userProfile) {
      loadQuotes();
    }
  }, [refreshKey, currentUser, userProfile, authLoading, navigate]);

  const loadQuotes = async () => {
    if (!currentUser || !userProfile) {
      return;
    }

    try {
      setLoading(true);
      const isAdmin = userProfile.isAdmin || false;
      console.log('Loading quotes for user:', currentUser.uid, 'isAdmin:', isAdmin);

      const data = await quoteService.getAll(currentUser.uid, isAdmin);
      console.log('Quotes loaded:', data.length);
      setQuotes(data);
      setError('');
    } catch (err) {
      console.error('Erro ao carregar orçamentos:', err);
      setError('Não foi possível carregar os orçamentos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleCreateQuote = () => {
    console.log('Tentando criar nova cotação');
    console.log('URL de destino:', '/cotacoes/novo');
    try {
      navigate('/cotacoes/novo');
    } catch (error) {
      console.error('Erro ao navegar para criação:', error);
    }
  };

  const handleViewQuote = (quoteId: string) => {
    console.log('Tentando visualizar cotação:', quoteId);
    console.log('URL de destino:', `/cotacoes/${quoteId}`);
    try {
      navigate(`/cotacoes/${quoteId}`);
    } catch (error) {
      console.error('Erro ao navegar para visualização:', error);
    }
  };

  const handleEditQuote = (quoteId: string) => {
    console.log('Tentando editar cotação:', quoteId);
    console.log('URL de destino:', `/cotacoes/${quoteId}/editar`);
    try {
      navigate(`/cotacoes/${quoteId}/editar`);
    } catch (error) {
      console.error('Erro ao navegar para edição:', error);
    }
  };

  if (loading || authLoading) {
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

  const isAdmin = userProfile?.isAdmin || false;

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
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {isAdmin ? 'Todos os Orçamentos' : 'Meus Orçamentos'}
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
            onClick={handleCreateQuote}
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
            Novo Orçamento
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {quotes.length === 0 ? (
          <Grid item xs={12}>
            <Card sx={{ 
              textAlign: 'center', 
              py: 8,
              background: alpha(theme.palette.action.hover, 0.05),
              border: `2px dashed ${alpha(theme.palette.divider, 0.2)}`
            }}>
              <AssignmentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Nenhum orçamento encontrado
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Clique em "Novo Orçamento" para criar
              </Typography>
            </Card>
          </Grid>
        ) : (
          quotes.map((quote, index) => (
            <Grid item xs={12} md={6} lg={4} key={quote.id || index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        Orçamento #{quote.id}
                      </Typography>
                      <Chip
                        label={getStatusText(quote.status)}
                        color={getStatusColor(quote.status) as any}
                        size="small"
                        sx={{ fontWeight: 'medium' }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Cliente: {quote.clientName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Data: {new Date(quote.date.toDate()).toLocaleDateString()}
                    </Typography>
                    {isAdmin && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Criado por: {quote.createdBy}
                      </Typography>
                    )}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 2 
                    }}>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        {quote.total.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </Typography>
                      <Box>
                        <IconButton
                          onClick={(e) => {
                            console.log('Botão visualizar clicado');
                            console.log('Dados da cotação:', quote);
                            e.stopPropagation();
                            e.preventDefault();
                            if (quote.id) {
                              handleViewQuote(quote.id);
                            } else {
                              console.error('ID da cotação não encontrado:', quote);
                            }
                          }}
                          size="small"
                          color="primary"
                          sx={{ mr: 1 }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          onClick={(e) => {
                            console.log('Botão editar clicado');
                            console.log('Dados da cotação:', quote);
                            e.stopPropagation();
                            e.preventDefault();
                            if (quote.id) {
                              handleEditQuote(quote.id);
                            } else {
                              console.error('ID da cotação não encontrado:', quote);
                            }
                          }}
                          size="small"
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}
