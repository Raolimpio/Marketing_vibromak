import { Box, Typography, TextField, IconButton, Button, Alert } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { itemVariants } from './animations';

interface Specification {
  key: string;
  value: string;
}

interface SpecificationsStepProps {
  specs: Specification[];
  validationErrors: Record<string, string>;
  onSpecChange: (index: number, field: 'key' | 'value', value: string) => void;
  onAddSpec: () => void;
  onRemoveSpec: (index: number) => void;
}

export default function SpecificationsStep({
  specs,
  validationErrors,
  onSpecChange,
  onAddSpec,
  onRemoveSpec
}: SpecificationsStepProps) {
  return (
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
                onChange={(e) => onSpecChange(index, 'key', e.target.value)}
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
                onChange={(e) => onSpecChange(index, 'value', e.target.value)}
                sx={{ 
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
              />
              <IconButton
                color="error"
                onClick={() => onRemoveSpec(index)}
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
        onClick={onAddSpec}
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
  );
}
