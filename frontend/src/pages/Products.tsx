import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  InputAdornment,
  Alert,
  CircularProgress,
  Fab,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Search,
  FilterList,
  Refresh as RefreshIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types/Product';
import { productService } from '../services/productService';
import { formatCurrency } from '../utils/format';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export default function Products() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [categories, setCategories] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setRefreshing(true);
      const data = await productService.getAll();
      setProducts(data);
      const uniqueCategories = [...new Set(data.map(p => p.category))].filter(Boolean);
      setCategories(uniqueCategories);
      setError('');
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setError('Não foi possível carregar os produtos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredProducts = products
    .filter(product =>
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!category || product.category === category)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (a.price || 0) - (b.price || 0);
        case 'priceDesc':
          return (b.price || 0) - (a.price || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'nameDesc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  const ProductCard = ({ product }: { product: Product }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3 }
      }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'visible',
          borderRadius: '16px',
          bgcolor: theme.palette.background.paper,
          boxShadow: theme.shadows[1],
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: theme.shadows[4],
            transform: 'translateY(-4px)',
            bgcolor: theme.palette.action.hover
          }
        }}
        onClick={() => navigate(`/produtos/${product.id}`)}
      >
        {product.category && (
          <Chip
            label={product.category}
            size="small"
            color="primary"
            sx={{
              position: 'absolute',
              top: -10,
              right: 10,
              zIndex: 1,
              borderRadius: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
              fontSize: '0.75rem'
            }}
          />
        )}
        
        <CardMedia
          component="img"
          height="200"
          image={product.image || '/placeholder-product.png'}
          alt={product.name}
          sx={{
            objectFit: 'contain',
            p: 2,
            backgroundColor: 'grey.50',
            borderRadius: '16px 16px 0 0'
          }}
        />
        <CardContent 
          sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 1,
            p: 3
          }}
        >
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            noWrap
            sx={{ 
              fontWeight: 600,
              color: theme.palette.text.primary
            }}
          >
            {product.name}
          </Typography>
          
          {product.code && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.text.secondary,
                fontFamily: 'monospace',
                backgroundColor: theme.palette.grey[100],
                p: 0.5,
                borderRadius: 1,
                display: 'inline-block'
              }}
            >
              {product.code}
            </Typography>
          )}
          
          <Typography
            variant="h6"
            color="primary"
            sx={{ 
              mt: 'auto', 
              fontWeight: 700,
              fontSize: '1.5rem'
            }}
          >
            {formatCurrency(product.price || 0)}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <Box 
        sx={{ 
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ 
          mb: 4,
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Produtos
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Atualizar produtos">
              <IconButton 
                onClick={loadProducts}
                disabled={refreshing}
                sx={{ 
                  '&:hover': { 
                    transform: 'rotate(180deg)',
                    transition: 'transform 0.3s'
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/produtos/novo')}
              sx={{
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                }
              }}
            >
              Novo Produto
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: '12px',
              animation: 'slideIn 0.5s ease-out'
            }}
          >
            {error}
          </Alert>
        )}

        <Box 
          sx={{ 
            mb: 4,
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            backgroundColor: 'background.paper',
            p: 2,
            borderRadius: '16px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}
        >
          <TextField
            sx={{ 
              flexGrow: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              }
            }}
            variant="outlined"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl 
            sx={{ 
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              }
            }}
          >
            <InputLabel>Categoria</InputLabel>
            <Select
              value={category}
              label="Categoria"
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="">Todas</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl 
            sx={{ 
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              }
            }}
          >
            <InputLabel>Ordenar por</InputLabel>
            <Select
              value={sortBy}
              label="Ordenar por"
              onChange={(e) => setSortBy(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <SortIcon />
                </InputAdornment>
              }
            >
              <MenuItem value="name">Nome (A-Z)</MenuItem>
              <MenuItem value="nameDesc">Nome (Z-A)</MenuItem>
              <MenuItem value="price">Preço (Menor-Maior)</MenuItem>
              <MenuItem value="priceDesc">Preço (Maior-Menor)</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={3}>
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        </motion.div>

        {filteredProducts.length === 0 && !loading && (
          <Box 
            sx={{ 
              textAlign: 'center',
              py: 8,
              px: 2,
              backgroundColor: 'background.paper',
              borderRadius: '16px',
              mt: 4
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum produto encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tente ajustar seus filtros ou criar um novo produto
            </Typography>
          </Box>
        )}
      </motion.div>
    </Box>
  );
}
