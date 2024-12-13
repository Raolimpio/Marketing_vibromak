import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Grid,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  useTheme,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  Share as ShareIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Print as PrintIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { quoteService, Quote, QuoteStatus, QUOTE_STATUS_INFO } from '../services/quoteService';
import { pdfService } from '../services/pdfService';
import QuoteStatusManager from '../components/QuoteStatusManager';
import TransferQuoteDialog from '../components/TransferQuoteDialog';
import { useAuth } from '../hooks/useAuth';

const AnimatedDiv = motion.div;

export default function QuoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { currentUser, isAdmin } = useAuth();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (id) {
      loadQuote();
    }
  }, [id, currentUser, navigate]);

  const loadQuote = async () => {
    if (!id || !currentUser) return;
    
    try {
      setLoading(true);
      const userId = location.state?.fromClientId || currentUser.uid;
      const data = await quoteService.getById(id, userId, isAdmin);
      if (!data) {
        setError('Orçamento não encontrado');
        return;
      }
      setQuote(data);
    } catch (error: any) {
      console.error('Erro ao carregar orçamento:', error);
      setError(error.message || 'Não foi possível carregar os detalhes do orçamento.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!quote) return;
    try {
      const pdf = await pdfService.generateQuotePDF(quote);
      // Implementar download do PDF
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      setError('Não foi possível gerar o PDF do orçamento.');
    }
  };

  const handleShare = () => {
    // Implementar compartilhamento
  };

  const handleSendEmail = () => {
    // Implementar envio de email
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async () => {
    if (!id || !currentUser) return;

    try {
      setDeleting(true);
      await quoteService.delete(id, currentUser.uid, isAdmin);
      navigate('/orcamentos');
    } catch (error: any) {
      console.error('Erro ao excluir orçamento:', error);
      setError(error.message || 'Não foi possível excluir o orçamento.');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleStatusChange = async (newStatus: QuoteStatus, notes: string) => {
    if (!quote || !id || !currentUser) return;

    try {
      setLoading(true);
      const statusHistoryItem = {
        status: newStatus,
        date: new Date(),
        notes
      };

      const updatedQuote = {
        ...quote,
        status: newStatus,
        statusHistory: [...(quote.statusHistory || []), statusHistoryItem]
      };

      await quoteService.update(id, updatedQuote, currentUser.uid, isAdmin);
      setQuote(updatedQuote);
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      setError(error.message || 'Erro ao atualizar status. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const canEditQuote = Boolean(
    isAdmin || (quote && currentUser && quote.createdBy === currentUser.uid)
  );

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

  if (!quote) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Orçamento não encontrado
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/orcamentos')}
          >
            Voltar
          </Button>
          {(isAdmin || quote.createdBy === currentUser?.uid) && (
            <>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/orcamentos/${id}/editar`)}
              >
                Editar
              </Button>
              <Button
                variant="outlined"
                color="info"
                startIcon={<ShareIcon />}
                onClick={() => setTransferDialogOpen(true)}
              >
                Transferir
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Excluir
              </Button>
            </>
          )}
        </Box>

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
            Orçamento #{quote.number}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Compartilhar">
              <IconButton onClick={handleShare} size="small">
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Baixar PDF">
              <IconButton onClick={handleDownloadPDF} size="small">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Enviar por Email">
              <IconButton onClick={handleSendEmail} size="small">
                <EmailIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Imprimir">
              <IconButton onClick={handlePrint} size="small">
                <PrintIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <AnimatedDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card sx={{ p: 3, mb: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2 
              }}>
                <Typography variant="h6">
                  Informações do Cliente
                </Typography>
                <Chip
                  label={QUOTE_STATUS_INFO[quote.status].label}
                  color={QUOTE_STATUS_INFO[quote.status].color as any}
                  sx={{ fontWeight: 'medium' }}
                />
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Nome
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {quote.clientName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {quote.clientEmail || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Telefone
                  </Typography>
                  <Typography variant="body1">
                    {quote.clientPhone || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Data
                  </Typography>
                  <Typography variant="body1">
                    {new Date(quote.date).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </Card>

            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Itens do Orçamento
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  marginBottom: '1rem'
                }}>
                  <thead>
                    <tr style={{ 
                      backgroundColor: theme.palette.grey[50],
                      borderBottom: `1px solid ${theme.palette.grey[200]}`
                    }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Produto</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Quantidade</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Preço Unit.</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.items.map((item, index) => (
                      <tr key={index} style={{ 
                        borderBottom: `1px solid ${theme.palette.grey[100]}`
                      }}>
                        <td style={{ padding: '12px' }}>{item.productName}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>{item.quantity}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {item.unitPrice.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          })}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {item.total.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Subtotal: {quote.subtotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Desconto: {(quote.discount || 0).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </Typography>
                <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>
                  Total: {quote.total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </Typography>
              </Box>
            </Card>
          </AnimatedDiv>
        </Grid>

        <Grid item xs={12} md={4}>
          <AnimatedDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Observações
              </Typography>
              <Typography variant="body1" sx={{ 
                whiteSpace: 'pre-wrap',
                color: quote.notes ? 'text.primary' : 'text.disabled'
              }}>
                {quote.notes || 'Nenhuma observação'}
              </Typography>
            </Card>

            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Histórico
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Criado em: {new Date(quote.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Última modificação: {new Date(quote.updatedAt).toLocaleString()}
              </Typography>
              {isAdmin && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Criado por: {quote.createdBy}
                </Typography>
              )}
            </Card>
          </AnimatedDiv>
        </Grid>
      </Grid>

      {/* Status Manager */}
      {quote && (
        <Box sx={{ mb: 3 }}>
          <QuoteStatusManager
            currentStatus={quote.status}
            statusHistory={quote.statusHistory}
            onStatusChange={handleStatusChange}
            canEdit={canEditQuote}
            isAdmin={isAdmin}
          />
        </Box>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.
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
            startIcon={deleting ? <CircularProgress size={20} /> : null}
          >
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>

      <TransferQuoteDialog
        open={transferDialogOpen}
        onClose={() => setTransferDialogOpen(false)}
        quoteId={id || ''}
        onTransferComplete={loadQuote}
      />
    </Box>
  );
}
