import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Grid,
  Typography,
  IconButton,
  useTheme,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon,
  AttachMoney as MoneyIcon,
  CompareArrows as TransferIcon,
  Event as EventIcon,
  Update as UpdateIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { clientService } from '../services/clientService';
import { quoteService } from '../services/quoteService';
import { Client } from '../types/Client';

const MotionCard = motion(Card);

const formatDate = (date: Date | null): string => {
  if (!date) return 'Não disponível';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export default function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [client, setClient] = useState<Client | null>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const clientData = await clientService.getById(id);
        setClient(clientData);
        
        // Fetch quotes with transfer history
        const quotesData = await quoteService.getQuotesByClient(id);
        setQuotes(quotesData);
        
        setLoading(false);
      } catch (error) {
        setError('Erro ao carregar os dados do cliente');
        setLoading(false);
      }
    };

    if (id) {
      fetchClient();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError('');
      
      const clientData = await clientService.getById(id);
      if (!clientData) {
        setError('Cliente não encontrado.');
        return;
      }
      setClient(clientData);

      try {
        const quotesData = await quoteService.getQuotesByClient(id);
        setQuotes(quotesData);
      } catch (quotesError) {
        console.error('Erro ao carregar orçamentos:', quotesError);
        // Não mostrar erro de orçamentos para o usuário, apenas logar
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Não foi possível carregar os dados do cliente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await clientService.delete(id!);
      navigate('/clientes');
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      setError('Não foi possível excluir o cliente.');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
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

  if (!client) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Cliente não encontrado
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/clientes')}
          sx={{ mb: 2 }}
        >
          Voltar para Clientes
        </Button>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 'bold',
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {client.name}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Editar">
              <IconButton 
                onClick={() => navigate(`/clientes/${id}/editar`)}
                sx={{ color: theme.palette.warning.main }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir">
              <IconButton 
                onClick={() => setDeleteDialogOpen(true)}
                sx={{ color: theme.palette.error.main }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{ p: 3, mb: 3 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip
                label={getStatusText(client.status)}
                color={getStatusColor(client.status)}
                sx={{ mr: 2 }}
              />
              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventIcon sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    Criado em: {formatDate(client.createdAt)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <UpdateIcon sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    Atualizado em: {formatDate(client.updatedAt)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <List>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Email"
                  secondary={client.email}
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <PhoneIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Telefone"
                  secondary={client.phone}
                />
              </ListItem>

              {client.company && (
                <ListItem>
                  <ListItemIcon>
                    <BusinessIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Empresa"
                    secondary={client.company}
                  />
                </ListItem>
              )}

              {client.address && (
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Endereço"
                    secondary={`${client.address.street}, ${client.address.number}${client.address.complement ? ` - ${client.address.complement}` : ''}, ${client.address.neighborhood}, ${client.address.city} - ${client.address.state}, ${client.address.zipCode}`}
                  />
                </ListItem>
              )}
            </List>

            {client.notes && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Observações
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {client.notes}
                </Typography>
              </>
            )}
          </MotionCard>

          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            sx={{ p: 3 }}
          >
            <Typography variant="h6" sx={{ mb: 3 }}>
              Orçamentos
            </Typography>

            {quotes.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                py: 4,
                background: theme.palette.action.hover,
                borderRadius: 1
              }}>
                <AssignmentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Nenhum orçamento encontrado
                </Typography>
              </Box>
            ) : (
              <List>
                {quotes.map((quote) => (
                  <ListItem
                    key={quote.id}
                    button
                    onClick={() => navigate(`/orcamentos/${quote.id}`)}
                    sx={{
                      mb: 1,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemIcon>
                      <MoneyIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Orçamento #${quote.id.slice(-6)}`}
                      secondary={`Criado em ${formatDate(quote.createdAt)}`}
                    />
                    {quote.transferHistory && quote.transferHistory.length > 0 && (
                      <Tooltip title="Orçamento transferido">
                        <TransferIcon color="action" />
                      </Tooltip>
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </MotionCard>
        </Grid>
      </Grid>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDelete}
            color="error"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={24} /> : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
