import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import { quoteService, Quote, QUOTE_STATUS_INFO } from '../services/quoteService';
import { useAuth } from '../hooks/useAuth';
import { categoryService, Category } from '../services/categoryService';
import { machineService, Machine } from '../services/machineService';
import QuickProductDialog from '../components/QuickProductDialog';
import { Timestamp } from 'firebase/firestore';

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

export default function QuoteCreate() {
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
  const [quickProductDialogOpen, setQuickProductDialogOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [quoteNumber, setQuoteNumber] = useState('');
  const [quoteDate, setQuoteDate] = useState<Date>(new Date());
  const [quoteStatus, setQuoteStatus] = useState<'enviado' | 'negociacao' | 'fechado' | 'perdido'>('enviado');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadInitialData();
    generateQuoteNumber();
  }, [currentUser, navigate]);

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

  const generateQuoteNumber = async () => {
    try {
      if (!currentUser) {
        setError('Usuário não autenticado');
        return;
      }
      // Busca todas as cotações que o usuário tem acesso
      const allQuotes = await quoteService.getAll(currentUser.uid, isAdmin);
      // Gera o próximo número sequencial
      const nextNumber = String(allQuotes.length + 1).padStart(4, '0');
      setQuoteNumber(nextNumber);
    } catch (error) {
      console.error('Erro ao gerar número do orçamento:', error);
      setError('Erro ao gerar número do orçamento. Tente novamente.');
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
    const newItems = [...items];
    if (product) {
      newItems[index] = {
        productId: product.id,
        productName: product.name,
        quantity: newItems[index]?.quantity || 1,
        unitPrice: product.price || 0,
        total: (product.price || 0) * (newItems[index]?.quantity || 1)
      };
    } else {
      newItems[index] = {
        productId: '',
        productName: '',
        quantity: 1,
        unitPrice: 0,
        total: 0
      };
    }
    setItems(newItems);
  };

  const handleClientChange = (client: Client | null) => {
    if (!client || !client.id) return;
    setSelectedClient(client as QuoteClient);
  };

  const handleStatusChange = (event: any) => {
    setQuoteStatus(event.target.value);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...items];
    const item = newItems[index];
    if (item) {
      item.quantity = quantity;
      item.total = item.unitPrice * quantity;
      setItems(newItems);
    }
  };

  const handleUnitPriceChange = (index: number, price: number) => {
    const newItems = [...items];
    const item = newItems[index];
    if (item) {
      item.unitPrice = price;
      item.total = price * item.quantity;
      setItems(newItems);
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - discount;
  };

  const handleCreateQuote = async () => {
    try {
      if (!currentUser) {
        setError('Usuário não autenticado');
        return;
      }

      if (!selectedClient) {
        setError('Por favor, selecione um cliente');
        return;
      }

      if (items.length === 0) {
        setError('Adicione pelo menos um item à cotação');
        return;
      }

      if (!quoteNumber) {
        setError('Número da cotação é obrigatório');
        return;
      }

      setSaving(true);
      setError('');

      const subtotal = items.reduce((acc, item) => acc + item.total, 0);
      const total = subtotal - (discount || 0);

      const newQuote: Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory'> = {
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        clientEmail: selectedClient.email || '',
        clientPhone: selectedClient.phone || '',
        date: Timestamp.fromDate(quoteDate),
        items: items.map(item => ({
          ...item,
          total: item.quantity * item.unitPrice
        })),
        subtotal,
        discount: discount || 0,
        total,
        status: quoteStatus,
        notes: notes || '',
        createdBy: currentUser.uid, // O criador é sempre o usuário atual
        sellerName: currentUser.displayName || '',
        lastUpdatedBy: currentUser.uid
      };

      const quoteId = await quoteService.create(newQuote, currentUser.uid);
      
      // Adiciona o histórico de status inicial
      await quoteService.addStatusHistory(
        quoteId,
        quoteStatus,
        currentUser.uid
      );

      navigate('/quotes');
    } catch (error: any) {
      console.error('Erro ao criar orçamento:', error);
      setError(error.message || 'Erro ao criar orçamento. Por favor, tente novamente.');
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
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ 
          fontWeight: 'bold',
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Novo Orçamento
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/quotes')}
        >
          Voltar
        </Button>
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
                getOptionLabel={(client) => `${client.name}${client.email ? ` - ${client.email}` : ''}`}
                value={selectedClient}
                onChange={(_, newValue) => handleClientChange(newValue)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <div>
                      <Typography variant="body1">{option.name}</Typography>
                      {option.email && (
                        <Typography variant="caption" color="text.secondary">
                          {option.email}
                        </Typography>
                      )}
                    </div>
                  </li>
                )}
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
                                color="error"
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
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Número do Orçamento"
                            variant="outlined"
                            fullWidth
                            value={quoteNumber}
                            disabled
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Data do Orçamento"
                            type="date"
                            variant="outlined"
                            fullWidth
                            value={quoteDate.toISOString().split('T')[0]}
                            onChange={(e) => setQuoteDate(new Date(e.target.value))}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            sx={{ mb: 2 }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                            <InputLabel id="status-select-label">Status</InputLabel>
                            <Select
                                labelId="status-select-label"
                                id="status-select"
                                value={quoteStatus}
                                onChange={handleStatusChange}
                                label="Status"
                            >
                                {Object.keys(QUOTE_STATUS_INFO).map((status) => (
                                    <MenuItem key={status} value={status}>
                                        {QUOTE_STATUS_INFO[status as 'enviado' | 'negociacao' | 'fechado' | 'perdido'].label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

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
                  onClick={() => navigate('/quotes')}
                  startIcon={<CancelIcon />}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  onClick={handleCreateQuote}
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
                  {saving ? 'Criando...' : 'Criar Orçamento'}
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
