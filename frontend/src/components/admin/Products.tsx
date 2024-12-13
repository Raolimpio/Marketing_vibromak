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
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { productService } from '../../services/productService';

const MotionCard = motion(Card);

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  status: string;
  imageUrl?: string;
}

export default function Products() {
  const theme = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setError('Não foi possível carregar os produtos. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product: Product | null = null) => {
    setSelectedProduct(product);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedProduct(null);
    setOpenDialog(false);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (selectedProduct?.id) {
        await productService.update(selectedProduct.id, selectedProduct);
        setSnackbar({
          open: true,
          message: 'Produto atualizado com sucesso!',
          severity: 'success',
        });
      } else {
        await productService.create(selectedProduct as Product);
        setSnackbar({
          open: true,
          message: 'Produto criado com sucesso!',
          severity: 'success',
        });
      }
      handleCloseDialog();
      loadProducts();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar produto. Por favor, tente novamente.',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await productService.delete(id);
        setSnackbar({
          open: true,
          message: 'Produto excluído com sucesso!',
          severity: 'success',
        });
        loadProducts();
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao excluir produto. Por favor, tente novamente.',
          severity: 'error',
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
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
          <Typography variant="h6">Gerenciamento de Produtos</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            }}
          >
            Novo Produto
          </Button>
        </Box>

        <Box sx={{ display: 'flex', mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar produtos..."
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
                <TableCell>Produto</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell align="right">Preço</TableCell>
                <TableCell align="right">Estoque</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {product.imageUrl ? (
                        <Box
                          component="img"
                          src={product.imageUrl}
                          alt={product.name}
                          sx={{ width: 40, height: 40, borderRadius: 1, mr: 2 }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            mr: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'grey.100',
                          }}
                        >
                          <ImageIcon color="action" />
                        </Box>
                      )}
                      <Box>
                        <Typography variant="body1">{product.name}</Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {product.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.category}
                      size="small"
                      sx={{
                        bgcolor: theme.palette.primary.main + '20',
                        color: theme.palette.primary.main,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(product.price)}
                  </TableCell>
                  <TableCell align="right">{product.stock}</TableCell>
                  <TableCell>
                    <Chip
                      label={product.status}
                      size="small"
                      color={product.status === 'Disponível' ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton onClick={() => handleOpenDialog(product)} size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton onClick={() => handleDelete(product.id)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
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
            {selectedProduct ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="Nome"
                value={selectedProduct?.name || ''}
                onChange={(e) => setSelectedProduct({ ...selectedProduct!, name: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Descrição"
                multiline
                rows={3}
                value={selectedProduct?.description || ''}
                onChange={(e) => setSelectedProduct({ ...selectedProduct!, description: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Preço"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
                value={selectedProduct?.price || ''}
                onChange={(e) => setSelectedProduct({ ...selectedProduct!, price: Number(e.target.value) })}
                required
              />
              <FormControl fullWidth>
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={selectedProduct?.category || ''}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct!, category: e.target.value })}
                  label="Categoria"
                  required
                >
                  <MenuItem value="Eletrônicos">Eletrônicos</MenuItem>
                  <MenuItem value="Roupas">Roupas</MenuItem>
                  <MenuItem value="Alimentos">Alimentos</MenuItem>
                  <MenuItem value="Outros">Outros</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Estoque"
                type="number"
                value={selectedProduct?.stock || ''}
                onChange={(e) => setSelectedProduct({ ...selectedProduct!, stock: Number(e.target.value) })}
                required
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedProduct?.status || ''}
                  onChange={(e) => setSelectedProduct({ ...selectedProduct!, status: e.target.value })}
                  label="Status"
                  required
                >
                  <MenuItem value="Disponível">Disponível</MenuItem>
                  <MenuItem value="Indisponível">Indisponível</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="URL da Imagem"
                value={selectedProduct?.imageUrl || ''}
                onChange={(e) => setSelectedProduct({ ...selectedProduct!, imageUrl: e.target.value })}
              />
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
