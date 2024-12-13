import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Card,
  CardMedia,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
  Tabs,
  Tab,
  Divider,
  Stack,
  Snackbar
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  PictureAsPdf,
  VideoLibrary,
  Description,
  Image,
  Share,
  Download,
  ViewAgenda,
  MenuBook,
  OndemandVideo,
} from '@mui/icons-material';
import { Product } from '../types/Product';
import { productService } from '../services/productService';
import { formatCurrency } from '../utils/format';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `product-tab-${index}`,
    'aria-controls': `product-tabpanel-${index}`,
  };
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true);
      const productData = await productService.getById(productId);
      if (!productData) {
        throw new Error('Produto não encontrado');
      }
      setProduct(productData);
      setError('');
    } catch (err) {
      console.error('Erro ao carregar produto:', err);
      setError('Não foi possível carregar os detalhes do produto.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product?.id || !window.confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      await productService.delete(product.id);
      navigate('/produtos');
    } catch (err) {
      console.error('Erro ao excluir produto:', err);
      setError('Não foi possível excluir o produto.');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleShare = async (url: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product?.name || 'Compartilhar produto',
          text: product?.description || 'Confira este produto',
          url: url
        });
        setSnackbarMessage('Conteúdo compartilhado com sucesso!');
      } else {
        await navigator.clipboard.writeText(url);
        setSnackbarMessage('Link copiado para a área de transferência!');
      }
    } catch (error) {
      setSnackbarMessage('Erro ao compartilhar. Link copiado para a área de transferência.');
      await navigator.clipboard.writeText(url);
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Produto não encontrado</Alert>
      </Box>
    );
  }

  const renderDocumentList = (type: string) => {
    const documents = product.documents?.filter(doc => doc.type === type) || [];
    
    return (
      <List>
        {documents.map((doc, index) => (
          <ListItem
            key={index}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: '12px',
              mb: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <ListItemIcon>
              {type === 'vista_explodida' ? <ViewAgenda /> : <MenuBook />}
            </ListItemIcon>
            <ListItemText 
              primary={doc.title}
              sx={{ flex: 1 }}
            />
            <Stack direction="row" spacing={1}>
              <IconButton
                onClick={() => handleShare(doc.external_link)}
                sx={{
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.light',
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <Share />
              </IconButton>
              <IconButton
                onClick={() => handleDownload(doc.external_link)}
                sx={{
                  bgcolor: 'success.light',
                  color: 'success.main',
                  '&:hover': {
                    bgcolor: 'success.light',
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <Download />
              </IconButton>
            </Stack>
          </ListItem>
        ))}
        {documents.length === 0 && (
          <Alert severity="info" sx={{ borderRadius: '12px' }}>
            Nenhum documento disponível
          </Alert>
        )}
      </List>
    );
  };

  const renderVideoList = () => {
    const videos = product.videos?.filter(video => video.type === 'tecnico') || [];
    
    return (
      <List>
        {videos.map((video, index) => (
          <ListItem
            key={index}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: '12px',
              mb: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
          >
            <ListItemIcon>
              <OndemandVideo />
            </ListItemIcon>
            <ListItemText 
              primary={video.title}
              sx={{ flex: 1 }}
            />
            <Stack direction="row" spacing={1}>
              <IconButton
                onClick={() => handleShare(video.external_link)}
                sx={{
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.light',
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <Share />
              </IconButton>
              <IconButton
                onClick={() => handleDownload(video.external_link)}
                sx={{
                  bgcolor: 'success.light',
                  color: 'success.main',
                  '&:hover': {
                    bgcolor: 'success.light',
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <Download />
              </IconButton>
            </Stack>
          </ListItem>
        ))}
        {videos.length === 0 && (
          <Alert severity="info" sx={{ borderRadius: '12px' }}>
            Nenhum vídeo disponível
          </Alert>
        )}
      </List>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => navigate('/produtos')}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                bgcolor: 'background.paper',
                transform: 'scale(1.1)'
              }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {product.name}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Editar">
            <IconButton
              onClick={() => navigate(`/produtos/${product.id}/editar`)}
              sx={{ 
                bgcolor: 'background.paper',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': {
                  bgcolor: 'background.paper',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton
              onClick={handleDelete}
              sx={{ 
                bgcolor: 'background.paper',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': {
                  bgcolor: 'background.paper',
                  transform: 'scale(1.1)',
                  color: 'error.main'
                }
              }}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}>
            <CardMedia
              component="img"
              height="400"
              image={product.image || '/placeholder-product.png'}
              alt={product.name}
              sx={{ objectFit: 'contain', bgcolor: 'grey.50' }}
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3,
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              Detalhes do Produto
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Código:</strong> {product.code}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Categoria:</strong> {product.category}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Preço:</strong> {formatCurrency(product.price || 0)}
              </Typography>
              
              {product.description && (
                <>
                  <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                    <strong>Descrição:</strong>
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {product.description}
                  </Typography>
                </>
              )}

              {Object.entries(product.specs || {}).length > 0 && (
                <>
                  <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                    <strong>Especificações:</strong>
                  </Typography>
                  <List dense>
                    {Object.entries(product.specs || {}).map(([key, value]) => (
                      <ListItem key={key}>
                        <ListItemText
                          primary={`${key}: ${value}`}
                          sx={{
                            '& .MuiListItemText-primary': {
                              color: 'text.secondary',
                            },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ 
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="product documentation tabs"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    minHeight: 64,
                    fontSize: '1rem',
                  },
                }}
              >
                <Tab 
                  icon={<ViewAgenda />} 
                  label="Vista Explodida" 
                  {...a11yProps(0)}
                  sx={{ gap: 1 }}
                />
                <Tab 
                  icon={<MenuBook />} 
                  label="Manuais" 
                  {...a11yProps(1)}
                  sx={{ gap: 1 }}
                />
                <Tab 
                  icon={<OndemandVideo />} 
                  label="Vídeos Técnicos" 
                  {...a11yProps(2)}
                  sx={{ gap: 1 }}
                />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              {renderDocumentList('vista_explodida')}
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              {renderDocumentList('manual')}
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              {renderVideoList()}
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
