import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Box,
  InputAdornment,
  SelectChangeEvent,
  ListItemText,
  Checkbox
} from '@mui/material';
import { Category, Machine, Product } from '../types/Product';
import { productService } from '../services/productService';
import { useDropzone } from 'react-dropzone';

interface QuickProductDialogProps {
  open: boolean;
  onClose: () => void;
  onProductCreated: (product: Product) => void;
  categories: Category[];
  machines: Machine[];
}

export default function QuickProductDialog({
  open,
  onClose,
  onProductCreated,
  categories,
  machines
}: QuickProductDialogProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    code: '',
    name: '',
    price: 0,
    category: '',
    machineIds: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setImageFile(acceptedFiles[0]);
      }
    }
  });

  const handleChange = (field: keyof Product) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'price' ? Number(value) : value
    }));
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setFormData((prev) => ({
      ...prev,
      category: event.target.value,
    }));
  };

  const handleMachineChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      machineIds: value as string[],
    }));
  };

  const validateForm = async () => {
    if (!formData.name || formData.price === undefined) {
      throw new Error('Por favor, preencha todos os campos obrigatórios.');
    }

    if (formData.price < 0) {
      throw new Error('O preço não pode ser negativo.');
    }

    // Verifica se já existe um produto com o mesmo código
    if (formData.code) {
      const existingProduct = await productService.getByCode(formData.code);
      if (existingProduct) {
        throw new Error('Já existe um produto com este código.');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      await validateForm();

      let imageUrl = '';
      if (imageFile) {
        imageUrl = await productService.uploadImage(imageFile);
      }

      const productData: Product = {
        ...formData as Product,
        image: imageUrl,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        machineIds: formData.machineIds || [],
      };

      const newProductId = await productService.create(productData);
      const newProduct = await productService.getById(newProductId);
      if (newProduct) {
        onProductCreated(newProduct);
      }
      onClose();
    } catch (err) {
      console.error('Erro ao criar produto:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar produto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cadastro Rápido de Produto</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Código"
              value={formData.code}
              onChange={handleChange('code')}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              fullWidth
              label="Nome *"
              value={formData.name}
              onChange={handleChange('name')}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Preço *"
              type="number"
              value={formData.price}
              onChange={handleChange('price')}
              disabled={loading}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={formData.category}
                onChange={handleCategoryChange}
                label="Categoria"
                disabled={loading}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Máquinas</InputLabel>
              <Select
                multiple
                value={formData.machineIds || []}
                onChange={handleMachineChange}
                label="Máquinas"
                disabled={loading}
                renderValue={(selected) => {
                  const selectedMachines = machines.filter(machine => selected.includes(machine.id || ''));
                  return selectedMachines.map(machine => machine.name).join(', ');
                }}
              >
                {machines.map((machine) => (
                  <MenuItem key={machine.id} value={machine.id}>
                    <Checkbox checked={(formData.machineIds || []).includes(machine.id || '')} />
                    <ListItemText primary={machine.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed #ccc',
                borderRadius: 1,
                p: 2,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main'
                }
              }}
            >
              <input {...getInputProps()} />
              {imageFile ? (
                <p>Imagem selecionada: {imageFile.name}</p>
              ) : (
                <p>Arraste uma imagem ou clique para selecionar (opcional)</p>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
