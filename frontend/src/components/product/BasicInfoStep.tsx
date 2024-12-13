import { TextField, Grid, FormControl, InputLabel, Select, MenuItem, InputAdornment } from '@mui/material';
import { motion } from 'framer-motion';
import { SelectChangeEvent } from '@mui/material';
import { itemVariants } from './animations';

const categories = [
  'Compactadores de Solo',
  'Placas Vibratórias',
  'Cortadoras',
  'Bombas',
  'Vibradores',
  'Motores',
  'Outros'
];

interface BasicInfoStepProps {
  product: {
    name: string;
    code: string;
    category: string;
    price: string;
  };
  validationErrors: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent<string>) => void;
}

export default function BasicInfoStep({ product, validationErrors, onChange }: BasicInfoStepProps) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <motion.div variants={itemVariants}>
          <TextField
            required
            fullWidth
            label="Nome"
            name="name"
            value={product.name}
            onChange={onChange}
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
            onChange={onChange}
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
              onChange={onChange}
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
            onChange={onChange}
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
  );
}
