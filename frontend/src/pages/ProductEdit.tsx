import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardMedia,
  Avatar,
  CircularProgress,
  SelectChangeEvent,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  Category as CategoryIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  ArrowBack,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Product, Document, Video } from '../types/Product';
import { productService } from '../services/productService';

const categories = [
  'Compactadores de Solo',
  'Placas Vibratórias',
  'Cortadoras',
  'Bombas',
  'Vibradores',
  'Motores',
  'Outros'
];

const steps = [
  {
    label: 'Informações Básicas',
    icon: <CategoryIcon />,
  },
  {
    label: 'Imagem e Descrição',
    icon: <DescriptionIcon />,
  },
  {
    label: 'Documentos e Vídeos',
    icon: <AttachFileIcon />,
  },
  {
    label: 'Especificações',
    icon: <SettingsIcon />,
  }
];

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

interface ProductForm {
  name: string;
  code: string;
  category: string;
  description: string;
  price: string;
  image: string;
  documents: Document[];
  videos: Video[];
}

export default function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [product, setProduct] = useState<ProductForm>({
    name: '',
    code: '',
    category: '',
    description: '',
    price: '',
    image: '',
    documents: [{ type: 'manual', title: '', external_link: '' }],
    videos: [{ type: 'tecnico', title: '', external_link: '' }]
  });

  const removeSpec = (index: number) => {
    if (specs.length > 1) {
      setSpecs(specs.filter((_, i) => i !== index));
    }
  };

  const addSpec = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      const productData = await productService.getById(productId);
      if (!productData) {
        throw new Error('Produto não encontrado');
      }
      
      setProduct({
        name: productData.name,
        code: productData.code || '',
        category: productData.category || '',
        description: productData.description || '',
        price: productData.price?.toString() || '',
        image: productData.image || '',
        documents: productData.documents?.length ? productData.documents : [{ type: 'manual', title: '', external_link: '' }],
        videos: productData.videos?.length ? productData.videos : [{ type: 'tecnico', title: '', external_link: '' }]
      });

      if (productData.image) {
        setImagePreview(productData.image);
      }

      if (productData.specs) {
        const specsArray = Object.entries(productData.specs).map(([key, value]) => ({
          key,
          value: value.toString()
        }));
        setSpecs(specsArray.length > 0 ? specsArray : [{ key: '', value: '' }]);
      }

      setError('');
    } catch (err) {
      console.error('Erro ao carregar produto:', err);
      setError('Não foi possível carregar os detalhes do produto.');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentChange = (index: number, field: string, value: string) => {
    const newDocuments = [...product.documents];
    newDocuments[index] = { 
      ...newDocuments[index], 
      [field]: field === 'type' ? (value as 'vista_explodida' | 'manual') : value 
    } as Document;
    setProduct(prev => ({ ...prev, documents: newDocuments }));
    
    if (validationErrors.documents) {
      setValidationErrors(prev => ({ ...prev, documents: '' }));
    }
  };

  const handleVideoChange = (index: number, field: string, value: string) => {
    const newVideos = [...product.videos];
    newVideos[index] = { 
      ...newVideos[index], 
      [field]: field === 'type' ? 'tecnico' : value 
    } as Video;
    setProduct(prev => ({ ...prev, videos: newVideos }));
    
    if (validationErrors.videos) {
      setValidationErrors(prev => ({ ...prev, videos: '' }));
    }
  };

  const addDocument = () => {
    setProduct(prev => ({
      ...prev,
      documents: [...prev.documents, { type: 'manual', title: '', external_link: '' }]
    }));
  };

  const removeDocument = (index: number) => {
    setProduct(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const addVideo = () => {
    setProduct(prev => ({
      ...prev,
      videos: [...prev.videos, { type: 'tecnico', title: '', external_link: '' }]
    }));
  };

  const removeVideo = (index: number) => {
    setProduct(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setProduct(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  });

  const validateStep = () => {
    const errors: Record<string, string> = {};
    
    if (activeStep === 0) {
      if (!product.name) errors.name = 'Nome é obrigatório';
      if (!product.code) errors.code = 'Código é obrigatório';
      if (!product.category) errors.category = 'Categoria é obrigatória';
      if (!product.price) errors.price = 'Preço é obrigatório';
      else if (isNaN(parseFloat(product.price))) errors.price = 'Preço inválido';
    }
    
    if (activeStep === 1) {
      if (!product.description) errors.description = 'Descrição é obrigatória';
    }

    if (activeStep === 2) {
      const invalidDocuments = product.documents.some(doc => doc.type && !doc.title || !doc.type && doc.title || doc.type && !doc.external_link || !doc.type && doc.external_link);
      if (invalidDocuments) errors.documents = 'Preencha todos os campos dos documentos';

      const invalidVideos = product.videos.some(video => video.type && !video.title || !video.type && video.title || video.type && !video.external_link || !video.type && video.external_link);
      if (invalidVideos) errors.videos = 'Preencha todos os campos dos vídeos';
    }
    
    if (activeStep === 3) {
      const invalidSpecs = specs.some(spec => spec.key && !spec.value || !spec.key && spec.value);
      if (invalidSpecs) errors.specs = 'Preencha ambos os campos das especificações';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (validateStep()) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveStep(prev => prev - 1);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name as string]: value
    }));
    
    if (validationErrors[name as string]) {
      setValidationErrors(prev => ({ ...prev, [name as string]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      // Filtra vídeos e documentos vazios
      const filteredVideos = product.videos.filter(
        video => video.title && video.external_link && video.type
      );
      
      const filteredDocuments = product.documents.filter(
        doc => doc.title && doc.external_link && doc.type
      );
  
      const productData: Partial<Product> = {
        name: product.name,
        code: product.code,
        category: product.category,
        description: product.description,
        price: parseFloat(product.price),
        image: product.image,
        videos: filteredVideos,
        documents: filteredDocuments,
        specs: specs.reduce((acc, spec) => {
          if (spec.key && spec.value) {
            acc[spec.key] = spec.value;
          }
          return acc;
        }, {} as Record<string, string>)
      };
  
      await productService.update(id, productData);
      navigate('/produtos');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      setError('Erro ao atualizar produto. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <motion.div variants={itemVariants}>
                  <TextField
                    required
                    fullWidth
                    label="Nome"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    error={!!validationErrors.name}
                    helperText={validationErrors.name}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      }
                    }}
                  />
                </motion.div>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <motion.div variants={itemVariants}>
                  <TextField
                    required
                    fullWidth
                    label="Código"
                    name="code"
                    value={product.code}
                    onChange={handleChange}
                    error={!!validationErrors.code}
                    helperText={validationErrors.code}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      }
                    }}
                  />
                </motion.div>
              </Grid>

              <Grid item xs={12} sm={6}>
                <motion.div variants={itemVariants}>
                  <FormControl 
                    fullWidth 
                    required 
                    error={!!validationErrors.category}
                  >
                    <InputLabel>Categoria</InputLabel>
                    <Select
                      name="category"
                      value={product.category}
                      label="Categoria"
                      onChange={handleChange}
                      sx={{
                        borderRadius: '12px',
                      }}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </motion.div>
              </Grid>

              <Grid item xs={12} sm={6}>
                <motion.div variants={itemVariants}>
                  <TextField
                    fullWidth
                    required
                    label="Preço"
                    name="price"
                    type="number"
                    value={product.price}
                    onChange={handleChange}
                    error={!!validationErrors.price}
                    helperText={validationErrors.price}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      }
                    }}
                  />
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <motion.div variants={itemVariants}>
                  <Box
                    {...getRootProps()}
                    sx={{
                      border: '2px dashed',
                      borderColor: isDragActive ? 'primary.main' : 'grey.300',
                      borderRadius: '16px',
                      p: 4,
                      textAlign: 'center',
                      cursor: 'pointer',
                      bgcolor: isDragActive ? 'primary.50' : 'background.paper',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'primary.50',
                      },
                    }}
                  >
                    <input {...getInputProps()} />
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        bgcolor: isDragActive ? 'primary.main' : 'grey.200',
                        margin: '0 auto',
                        mb: 2
                      }}
                    >
                      <CloudUploadIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h6" gutterBottom color="textPrimary">
                      {isDragActive ? 'Solte a imagem aqui' : 'Arraste e solte uma imagem'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      ou clique para selecionar
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>

              {imagePreview && (
                <Grid item xs={12}>
                  <motion.div variants={itemVariants}>
                    <Card
                      sx={{
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="300"
                        image={imagePreview}
                        alt="Preview"
                        sx={{
                          objectFit: 'contain',
                          bgcolor: 'grey.50',
                        }}
                      />
                    </Card>
                  </motion.div>
                </Grid>
              )}

              <Grid item xs={12}>
                <motion.div variants={itemVariants}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Descrição"
                    name="description"
                    value={product.description}
                    onChange={handleChange}
                    error={!!validationErrors.description}
                    helperText={validationErrors.description}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                      }
                    }}
                  />
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                  Documentos
                </Typography>
                {product.documents.map((doc, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      gap: 2,
                      mb: 2,
                      p: 2,
                      bgcolor: 'background.paper',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    }}
                  >
                    <FormControl sx={{ flex: 1 }}>
                      <InputLabel>Tipo</InputLabel>
                      <Select
                        value={doc.type}
                        label="Tipo"
                        onChange={(e) => handleDocumentChange(index, 'type', e.target.value)}
                      >
                        <MenuItem value="vista_explodida">Vista Explodida</MenuItem>
                        <MenuItem value="manual">Manual</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      sx={{ flex: 1 }}
                      label="Título"
                      value={doc.title}
                      onChange={(e) => handleDocumentChange(index, 'title', e.target.value)}
                    />
                    <TextField
                      sx={{ flex: 2 }}
                      label="Link Externo"
                      value={doc.external_link}
                      onChange={(e) => handleDocumentChange(index, 'external_link', e.target.value)}
                    />
                    <IconButton
                      color="error"
                      onClick={() => removeDocument(index)}
                      sx={{
                        bgcolor: 'error.light',
                        color: 'error.main',
                        '&:hover': {
                          bgcolor: 'error.light',
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={addDocument}
                  variant="outlined"
                  sx={{
                    mt: 2,
                    borderRadius: '12px',
                    textTransform: 'none',
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                    }
                  }}
                >
                  Adicionar Documento
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600, mt: 4 }}>
                  Vídeos
                </Typography>
                {product.videos.map((video, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      gap: 2,
                      mb: 2,
                      p: 2,
                      bgcolor: 'background.paper',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    }}
                  >
                    <FormControl sx={{ flex: 1 }}>
                      <InputLabel>Tipo</InputLabel>
                      <Select
                        value={video.type}
                        label="Tipo"
                        onChange={(e) => handleVideoChange(index, 'type', e.target.value)}
                      >
                        <MenuItem value="tecnico">Vídeo Técnico</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      sx={{ flex: 1 }}
                      label="Título"
                      value={video.title}
                      onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
                    />
                    <TextField
                      sx={{ flex: 2 }}
                      label="Link Externo"
                      value={video.external_link}
                      onChange={(e) => handleVideoChange(index, 'external_link', e.target.value)}
                    />
                    <IconButton
                      color="error"
                      onClick={() => removeVideo(index)}
                      sx={{
                        bgcolor: 'error.light',
                        color: 'error.main',
                        '&:hover': {
                          bgcolor: 'error.light',
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={addVideo}
                  variant="outlined"
                  sx={{
                    mt: 2,
                    borderRadius: '12px',
                    textTransform: 'none',
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                    }
                  }}
                >
                  Adicionar Vídeo
                </Button>
              </Grid>
            </Grid>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Box>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  color: 'primary.main',
                  fontWeight: 600,
                  mb: 3
                }}
              >
                Especificações do Produto
              </Typography>

              {validationErrors.specs && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: '12px'
                  }}
                >
                  {validationErrors.specs}
                </Alert>
              )}

              <AnimatePresence>
                {specs.map((spec, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        gap: 2, 
                        mb: 2,
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      }}
                    >
                      <TextField
                        size="small"
                        label="Característica"
                        value={spec.key}
                        onChange={(e) => {
                          const newSpecs = [...specs];
                          newSpecs[index].key = e.target.value;
                          setSpecs(newSpecs);
                        }}
                        sx={{ 
                          flex: 1,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          }
                        }}
                      />
                      <TextField
                        size="small"
                        label="Valor"
                        value={spec.value}
                        onChange={(e) => {
                          const newSpecs = [...specs];
                          newSpecs[index].value = e.target.value;
                          setSpecs(newSpecs);
                        }}
                        sx={{ 
                          flex: 1,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          }
                        }}
                      />
                      <IconButton
                        color="error"
                        onClick={() => removeSpec(index)}
                        disabled={specs.length === 1}
                        sx={{
                          bgcolor: 'error.light',
                          color: 'error.main',
                          '&:hover': {
                            bgcolor: 'error.light',
                            transform: 'scale(1.1)',
                          },
                          '&.Mui-disabled': {
                            bgcolor: 'action.disabledBackground',
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </motion.div>
                ))}
              </AnimatePresence>

              <Button
                startIcon={<AddIcon />}
                onClick={addSpec}
                variant="outlined"
                sx={{
                  mt: 2,
                  borderRadius: '12px',
                  textTransform: 'none',
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                  }
                }}
              >
                Adicionar Especificação
              </Button>
            </Box>
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box 
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      sx={{ p: 3 }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4 
      }}>
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
            Editar Produto
          </Typography>
        </Box>
      </Box>

      <Card 
        sx={{ 
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          overflow: 'visible'
        }}
      >
        <Box sx={{ p: 4 }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4,
                borderRadius: '12px'
              }}
            >
              {error}
            </Alert>
          )}

          <Stepper 
            activeStep={activeStep} 
            sx={{ 
              mb: 4,
              '& .MuiStepLabel-root': {
                '& .MuiStepLabel-iconContainer': {
                  '& .MuiStepIcon-root': {
                    width: 40,
                    height: 40,
                    '&.Mui-active': {
                      color: 'primary.main',
                    },
                    '&.Mui-completed': {
                      color: 'success.main',
                    },
                  },
                },
              },
            }}
          >
            {steps.map(({ label, icon }) => (
              <Step key={label}>
                <StepLabel
                  StepIconComponent={() => (
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: activeStep === steps.findIndex(s => s.label === label)
                          ? 'primary.main'
                          : 'grey.300',
                      }}
                    >
                      {icon}
                    </Avatar>
                  )}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <form onSubmit={handleSubmit}>
            {getStepContent(activeStep)}

            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mt: 4,
                pt: 3,
                borderTop: 1,
                borderColor: 'divider'
              }}
            >
              <Button
                startIcon={<BackIcon />}
                onClick={handleBack}
                disabled={activeStep === 0}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  px: 4
                }}
              >Voltar
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    px: 4,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
                    }
                  }}
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  variant="contained"
                  endIcon={<NextIcon />}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    px: 4,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
                    }
                  }}
                >
                  Próximo
                </Button>
              )}
            </Box>
          </form>
        </Box>
      </Card>
    </Box>
  );
}