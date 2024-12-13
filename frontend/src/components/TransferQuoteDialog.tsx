import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Autocomplete,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { userService, User } from '../services/userService';
import { quoteService } from '../services/quoteService';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface TransferQuoteDialogProps {
  open: boolean;
  onClose: () => void;
  quoteId: string;
  onTransferComplete: () => void;
}

export default function TransferQuoteDialog({
  open,
  onClose,
  quoteId,
  onTransferComplete,
}: TransferQuoteDialogProps) {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersData = await userService.getAll();
      // Filtra o usuário atual da lista
      const filteredUsers = usersData.filter(user => user.id !== currentUser?.uid);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError('Erro ao carregar lista de usuários');
    }
  };

  const handleTransfer = async () => {
    if (!selectedUser || !currentUser) return;

    try {
      setLoading(true);
      await quoteService.transferQuote(
        quoteId,
        currentUser.uid,
        selectedUser.id,
        isAdmin
      );
      setSuccess(true);
      onTransferComplete();
      setTimeout(() => {
        onClose();
        navigate('/orcamentos');
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao transferir cotação:', error);
      setError(error.message || 'Erro ao transferir cotação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Transferir Cotação</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Cotação transferida com sucesso! Redirecionando...
          </Alert>
        )}
        <Autocomplete
          options={users}
          getOptionLabel={(user) => `${user.name} (${user.email})`}
          value={selectedUser}
          onChange={(_, newValue) => setSelectedUser(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Selecione o usuário"
              variant="outlined"
              fullWidth
              margin="normal"
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleTransfer}
          variant="contained"
          disabled={!selectedUser || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Transferir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
