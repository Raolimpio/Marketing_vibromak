import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Send as SendIcon,
  Handshake as HandshakeIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { QuoteStatus, QuoteStatusInfo, QUOTE_STATUS_INFO } from '../services/quoteService';

interface StatusHistoryItem {
  status: QuoteStatus;
  date: Date;
  notes?: string;
}

interface Props {
  currentStatus: QuoteStatus;
  statusHistory?: StatusHistoryItem[];
  onStatusChange: (newStatus: QuoteStatus, notes: string) => Promise<void>;
  canEdit: boolean;
  isAdmin?: boolean;
}

const StatusIcon = ({ status }: { status: QuoteStatus }) => {
  const icons = {
    enviado: <SendIcon />,
    negociacao: <HandshakeIcon />,
    fechado: <CheckCircleIcon />,
    perdido: <CancelIcon />
  };
  return icons[status];
};

const QuoteStatusManager: React.FC<Props> = ({ 
  currentStatus, 
  statusHistory = [], 
  onStatusChange,
  canEdit,
  isAdmin = false
}: Props) => {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<QuoteStatus | null>(null);
  const [notes, setNotes] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentStatusInfo = QUOTE_STATUS_INFO[currentStatus];
  const availableStatuses = currentStatusInfo?.nextStatuses || [];

  const handleStatusClick = (status: QuoteStatus) => {
    if (!canEdit) {
      setError('Você não tem permissão para alterar o status deste orçamento');
      return;
    }
    setSelectedStatus(status);
    setError('');
    setOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedStatus) return;

    setLoading(true);
    setError('');

    try {
      await onStatusChange(selectedStatus, notes);
      setOpen(false);
      setNotes('');
    } catch (err) {
      setError('Erro ao atualizar status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={currentStatusInfo?.label} // Use optional chaining to safely access label
            color={currentStatusInfo?.color as any}
            icon={<StatusIcon status={currentStatus} />}
          />
          {console.log('Current object:', currentStatusInfo)} // Add console log for debugging
          {availableStatuses.map((status) => {
            const statusInfo = QUOTE_STATUS_INFO[status];
            return (
              <Chip
                key={status}
                label={statusInfo?.label} // Use optional chaining to safely access label
                color={statusInfo?.color as any}
                icon={<StatusIcon status={status} />}
                onClick={() => handleStatusClick(status)}
                sx={{ cursor: canEdit ? 'pointer' : 'not-allowed' }}
              />
            );
          })}
        </Box>

        {statusHistory.length > 0 && (
          <Tooltip title="Ver histórico">
            <IconButton onClick={() => setHistoryOpen(true)} size="small">
              <HistoryIcon />
            </IconButton>
          </Tooltip>
        )}

        {!canEdit && (
          <Alert severity="info" sx={{ mt: 1 }}>
            Apenas {isAdmin ? 'administradores' : 'o criador'} podem alterar o status deste orçamento
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Modal de mudança de status */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Alterar Status para {selectedStatus && QUOTE_STATUS_INFO[selectedStatus]?.label} // Use optional chaining to safely access label
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Observações"
            fullWidth
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adicione observações sobre esta mudança de status..."
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleConfirm} 
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Atualizando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de histórico */}
      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Histórico de Status</DialogTitle>
        <DialogContent>
          <List>
            {statusHistory.map((item, index) => {
              const statusInfo = QUOTE_STATUS_INFO[item.status];
              
              return (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <StatusIcon status={item.status} />
                          <Typography variant="subtitle1">
                            {statusInfo?.label} // Use optional chaining to safely access label
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="caption" display="block">
                            {new Date(item.date).toLocaleString()}
                          </Typography>
                          {item.notes && (
                            <Typography variant="body2" color="text.secondary">
                              {item.notes}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                  {index < statusHistory.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default QuoteStatusManager;
