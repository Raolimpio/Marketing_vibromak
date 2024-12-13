import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Grid,
  TextField,
  Typography,
  Autocomplete,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  Alert,
  CircularProgress,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { clientService, Client } from '../services/clientService';
import { Product } from '../types/Product';
import { productService } from '../services/productService';
import { quoteService, Quote, QuoteStatus } from '../services/quoteService';
import { useAuth } from '../hooks/useAuth';
import { categoryService, Category } from '../services/categoryService';
import { machineService, Machine } from '../services/machineService';
import QuickProductDialog from '../components/QuickProductDialog';

// Interface para produto no contexto da cotação
interface QuoteProduct extends Omit<Product, 'id'> {
  id: string; // id é obrigatório neste contexto
}

// Interface para cliente no contexto da cotação
interface QuoteClient extends Omit<Client, 'id'> {
  id: string; // id é obrigatório neste contexto
}

interface QuoteItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const AnimatedDiv = motion.div;

export default function QuoteEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { currentUser, isAdmin } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<QuoteProduct[]>([]);
  const [selectedClient, setSelectedClient] = useState<QuoteClient | null>(null);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [originalQuote, setOriginalQuote] = useState<Quote | null>(null);
  const [quickProductDialogOpen, setQuickProductDialogOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (id) {
      loadInitialData();
    }
  }, [id, currentUser, navigate]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Primeiro carregamos os dados básicos
      await Promise.all([
        loadCategories(),
        loadMachines(),
        loadClients(),
        loadProducts()
      ]);

      // Depois carregamos o orçamento que depende dos dados anteriores
      await loadQuote();
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      setError('Erro ao carregar dados iniciais. Por favor, recarregue a página.');
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const clientsData = await clientService.getAll();
      setClients(clientsData);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setError('Erro ao carregar clientes. Por favor, tente novamente.');
    }
  };

  const loadProducts = async () => {
    try {
      const productsData = await productService.getAll();
      // Filtra apenas produtos com ID
      const validProducts = productsData.filter((p): p is QuoteProduct => 
        p.id !== undefined
      );
      setProducts(validProducts);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setError('Erro ao carregar produtos. Por favor, tente novamente.');
    }
  };

  const loadQuote = async () => {
    if (!id || !currentUser) return;

    try {
      const quoteData = await quoteService.getById(id, currentUser.uid, isAdmin);
      if (!quoteData) {
        setError('Orçamento não encontrado');
        return;
      }

      // Verificar permissão
      if (!isAdmin && quoteData.createdBy !== currentUser.uid) {
        navigate('/orcamentos');
        return;
      }

      setOriginalQuote(quoteData);

      // Encontrar o cliente correspondente nos clientes carregados
      const client = clients.find(c => c.id === quoteData.clientId);
      if (client && client.id) {
        setSelectedClient(client as QuoteClient);
      } else {
        // Se o cliente não for encontrado, criar um objeto temporário
        const now = new Date();
        setSelectedClient({
          id: quoteData.clientId,
          name: quoteData.clientName,
          email: quoteData.clientEmail || '',
          phone: quoteData.clientPhone || '',
          createdAt: now,
          updatedAt: now
        });
      }

      setItems(quoteData.items);
      setNotes(quoteData.notes || '');
      setDiscount(quoteData.discount || 0);
    } catch (error: any) {
      console.error('Erro ao carregar orçamento:', error);
      setError(error.message || 'Erro ao carregar orçamento. Por favor, tente novamente.');
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await categoryService.getAll();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setError('Erro ao carregar categorias. Por favor, tente novamente.');
    }
  };

  const loadMachines = async () => {
    try {
      const machinesData = await machineService.getAll();
      setMachines(machinesData);
    } catch (error) {
      console.error('Erro ao carregar máquinas:', error);
      setError('Erro ao carregar máquinas. Por favor, tente novamente.');
    }
  };

  const handleAddItem = () => {
    setItems([...items, {
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleProductChange = (index: number, product: QuoteProduct | null) => {
    if (!product) return;

    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productId: product.id,
      productName: product.name,
      unitPrice: product.price || 0,
      total: (product.price || 0) * newItems[index].quantity
    };
    setItems(newItems);
  };

  const handleClientChange = (client: Client | null) => {
    if (!client || !client.id) return;
    setSelectedClient(client as QuoteClient);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      quantity,
      total: newItems[index].unitPrice * quantity
    };
    setItems(newItems);
  };

  const handleUnitPriceChange = (index: number, unitPrice: number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      unitPrice,
      total: unitPrice * newItems[index].quantity
    };
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - discount;
  };

  const handleSave = async () => {
    if (!selectedClient || !currentUser || !originalQuote || !id) return;

    try {
      setSaving(true);
      const now = new Date();
      const updatedQuote: Partial<Quote> = {
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        clientEmail: selectedClient.email,
        clientPhone: selectedClient.phone,
        items,
        subtotal: calculateSubtotal(),
        discount,
        total: calculateTotal(),
        notes,
        updatedAt: now,
      };

      await quoteService.update(id, updatedQuote, currentUser.uid, isAdmin);
      navigate(`/orcamentos/${id}`);
    } catch (error: any) {
      console.error('Erro ao salvar orçamento:', error);
      setError(error.message || 'Erro ao salvar orçamento. Por favor, tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickProductCreated = (newProduct: Product) => {
    // Atualiza a lista de produtos
    setProducts(prevProducts => [...prevProducts, newProduct as QuoteProduct]);
    
    // Adiciona o produto à cotação atual
    const newItem: QuoteItem = {
      productId: newProduct.id || '',
      productName: newProduct.name,
      quantity: 1,
      unitPrice: newProduct.price,
      total: newProduct.price
    };
    setItems(prevItems => [...prevItems, newItem]);
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
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/orcamentos/${id}`)}
          sx={{ mb: 2 }}
        >
          Voltar para Detalhes
        </Button>

        <Typography variant="h4" component="h1" sx={{ 
          fontWeight: 'bold',
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Editar Orçamento
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ p: 3, mb: 3 }}>
            <AnimatedDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Cliente
              </Typography>
              <Autocomplete
                options={clients}
                getOptionLabel={(client) => client.name}
                value={selectedClient}
                onChange={(_, newValue) => handleClientChange(newValue)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField {...params} label="Cliente" required />
                )}
              />
            </AnimatedDiv>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ p: 3, mb: 3 }}>
            <AnimatedDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Itens do Orçamento</Typography>
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setQuickProductDialogOpen(true)}
                    sx={{ mr: 1 }}
                  >
                    Cadastrar Produto
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddItem}
                  >
                    Adicionar Item
                  </Button>
                </Box>
              </Box>

              {items.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  background: 'rgba(0, 0, 0, 0.02)',
                  border: '2px dashed rgba(0, 0, 0, 0.1)',
                  borderRadius: 1
                }}>
                  <Typography variant="h6" color="text.secondary">
                    Nenhum item adicionado
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    Clique em "Adicionar Item" para começar
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell width="40%">Produto</TableCell>
                        <TableCell align="right" width="15%">Quantidade</TableCell>
                        <TableCell align="right" width="20%">Preço Unit.</TableCell>
                        <TableCell align="right" width="15%">Total</TableCell>
                        <TableCell align="center" width="10%">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell width="40%">
                            <Autocomplete
                              fullWidth
                              options={products}
                              getOptionLabel={(product) => `${product.name}${product.code ? ` - ${product.code}` : ''}`}
                              value={products.find(p => p.id === item.productId) || null}
                              onChange={(_, newValue) => handleProductChange(index, newValue)}
                              isOptionEqualToValue={(option, value) => option.id === value.id}
                              renderOption={(props, option) => (
                                <li {...props} key={option.id}>
                                  <Box>
                                    <Typography variant="body1">
                                      {option.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {option.code && `Código: ${option.code}`}
                                      {option.price && ` - Preço: ${option.price.toLocaleString('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                      })}`}
                                    </Typography>
                                  </Box>
                                </li>
                              )}
                              renderInput={(params) => (
                                <TextField {...params} size="small" placeholder="Selecione um produto" />
                              )}
                            />
                          </TableCell>
                          <TableCell align="right" width="15%">
                            <TextField
                              fullWidth
                              type="number"
                              size="small"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                              InputProps={{ inputProps: { min: 1 } }}
                            />
                          </TableCell>
                          <TableCell align="right" width="20%">
                            <TextField
                              fullWidth
                              type="number"
                              size="small"
                              value={item.unitPrice}
                              onChange={(e) => handleUnitPriceChange(index, Number(e.target.value))}
                              InputProps={{ inputProps: { min: 0 } }}
                            />
                          </TableCell>
                          <TableCell align="right" width="15%">
                            {item.total.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })}
                          </TableCell>
                          <TableCell align="center" width="10%">
                            <Tooltip title="Remover item">
                              <IconButton 
                                onClick={() => handleRemoveItem(index)}
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </AnimatedDiv>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <AnimatedDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Finalização
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Observações"
                    multiline
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Adicione observações ou condições especiais do orçamento"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Desconto"
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">R$</InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ 
                mt: 4, 
                p: 2, 
                borderRadius: 1,
                background: theme.palette.grey[50],
                border: `1px solid ${theme.palette.grey[200]}`
              }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Subtotal: {calculateSubtotal().toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </Typography>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Desconto: {discount.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                  Total: {calculateTotal().toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </Typography>
              </Box>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/orcamentos/${id}`)}
                  startIcon={<CancelIcon />}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={!selectedClient || items.length === 0 || saving}
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .1)',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 10px 4px rgba(0, 0, 0, .1)',
                    }
                  }}
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </Box>
            </AnimatedDiv>
          </Card>
        </Grid>
      </Grid>
      <QuickProductDialog
        open={quickProductDialogOpen}
        onClose={() => setQuickProductDialogOpen(false)}
        onProductCreated={handleQuickProductCreated}
        categories={categories}
        machines={machines}
      />
    </Box>
  );
}
