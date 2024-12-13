import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  Chip,
  Avatar,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { userService } from '../../services/userService';

const MotionCard = motion(Card);

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

export default function Users() {
  const theme = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setError('Não foi possível carregar os usuários. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user: User | null = null) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedUser(null);
    setOpenDialog(false);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (selectedUser?.id) {
        await userService.update(selectedUser.id, selectedUser);
        setSnackbar({
          open: true,
          message: 'Usuário atualizado com sucesso!',
          severity: 'success',
        });
      } else {
        await userService.create(selectedUser as User);
        setSnackbar({
          open: true,
          message: 'Usuário criado com sucesso!',
          severity: 'success',
        });
      }
      handleCloseDialog();
      loadUsers();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar usuário. Por favor, tente novamente.',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await userService.delete(id);
        setSnackbar({
          open: true,
          message: 'Usuário excluído com sucesso!',
          severity: 'success',
        });
        loadUsers();
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao excluir usuário. Por favor, tente novamente.',
          severity: 'error',
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChangePassword = async () => {
    try {
      if (!selectedUser) return;

      if (newPassword !== confirmPassword) {
        setPasswordError('As senhas não coincidem');
        return;
      }

      if (newPassword.length < 6) {
        setPasswordError('A senha deve ter pelo menos 6 caracteres');
        return;
      }

      try {
        await userService.updatePassword(selectedUser.id, newPassword);
        
        setSnackbar({
          open: true,
          message: 'Senha alterada com sucesso!',
          severity: 'success',
        });
        
        setChangePasswordDialog(false);
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
      } catch (error: any) {
        if (error.message === 'Por favor, faça login novamente antes de alterar a senha') {
          setSnackbar({
            open: true,
            message: 'Por favor, faça logout e login novamente antes de alterar a senha',
            severity: 'warning',
          });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao alterar senha. Por favor, tente novamente.',
        severity: 'error',
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
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

  return (
    <Box>
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        sx={{ p: 3 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Gerenciamento de Usuários</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            }}
          >
            Novo Usuário
          </Button>
        </Box>

        <Box sx={{ display: 'flex', mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuário</TableCell>
                <TableCell>Função</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Último Acesso</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>{user.name[0]}</Avatar>
                      <Box>
                        <Typography variant="body1">{user.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      size="small"
                      sx={{
                        bgcolor: theme.palette.primary.main + '20',
                        color: theme.palette.primary.main,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      size="small"
                      color={user.status === 'Ativo' ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenDialog(user)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Alterar Senha">
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setSelectedUser(user);
                            setChangePasswordDialog(true);
                          }}
                          color="primary"
                        >
                          <LockIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(user.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </MotionCard>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSave}>
          <DialogTitle>
            {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="Nome"
                value={selectedUser?.name || ''}
                onChange={(e) => setSelectedUser({ ...selectedUser!, name: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="E-mail"
                type="email"
                value={selectedUser?.email || ''}
                onChange={(e) => setSelectedUser({ ...selectedUser!, email: e.target.value })}
                required
              />
              <FormControl fullWidth>
                <InputLabel>Função</InputLabel>
                <Select
                  value={selectedUser?.role || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser!, role: e.target.value })}
                  label="Função"
                  required
                >
                  <MenuItem value="Admin">Administrador</MenuItem>
                  <MenuItem value="User">Usuário</MenuItem>
                  <MenuItem value="Manager">Gerente</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedUser?.status || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser!, status: e.target.value })}
                  label="Status"
                  required
                >
                  <MenuItem value="Ativo">Ativo</MenuItem>
                  <MenuItem value="Inativo">Inativo</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              }}
            >
              Salvar
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={changePasswordDialog} onClose={() => setChangePasswordDialog(false)}>
        <DialogTitle>Alterar Senha</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Alterando senha para o usuário: {selectedUser?.name}
            </Typography>
            <TextField
              label="Nova Senha"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              error={!!passwordError}
            />
            <TextField
              label="Confirmar Nova Senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              error={!!passwordError}
              helperText={passwordError}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setChangePasswordDialog(false);
            setNewPassword('');
            setConfirmPassword('');
            setPasswordError('');
          }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleChangePassword}
            variant="contained"
            disabled={!newPassword || !confirmPassword}
          >
            Alterar Senha
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
