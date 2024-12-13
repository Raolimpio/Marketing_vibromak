import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { Delete as DeleteIcon, Upload as UploadIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { storage } from '../../../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

interface LogoManagerProps {
  currentLogo?: string;
  onLogoChange: (url: string) => void;
}

export const LogoManager: React.FC<LogoManagerProps> = ({ currentLogo, onLogoChange }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentLogo || null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validações
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('O arquivo deve ter no máximo 2MB.');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload para o Firebase Storage
      const storageRef = ref(storage, `logos/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Se houver logo anterior, deletar
      if (currentLogo) {
        try {
          const oldLogoRef = ref(storage, currentLogo);
          await deleteObject(oldLogoRef);
        } catch (error) {
          console.error('Erro ao deletar logo antiga:', error);
        }
      }

      onLogoChange(downloadURL);
    } catch (error) {
      console.error('Erro no upload:', error);
      setError('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!currentLogo) return;

    try {
      setUploading(true);
      const logoRef = ref(storage, currentLogo);
      await deleteObject(logoRef);
      setPreview(null);
      onLogoChange('');
    } catch (error) {
      console.error('Erro ao remover logo:', error);
      setError('Erro ao remover a logo. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Logo da Empresa
      </Typography>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Paper
          sx={{
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            border: '2px dashed',
            borderColor: 'grey.300',
            backgroundColor: 'grey.50',
          }}
        >
          {preview && (
            <Box
              component="img"
              src={preview}
              alt="Logo Preview"
              sx={{
                maxWidth: '200px',
                maxHeight: '100px',
                objectFit: 'contain',
                mb: 2,
              }}
            />
          )}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              component="label"
              variant="contained"
              startIcon={<UploadIcon />}
              disabled={uploading}
            >
              {uploading ? 'Enviando...' : 'Escolher Logo'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileSelect}
              />
            </Button>

            {preview && (
              <IconButton
                color="error"
                onClick={handleRemoveLogo}
                disabled={uploading}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>

          {uploading && (
            <CircularProgress size={24} sx={{ mt: 2 }} />
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}

          <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
            Tamanho máximo: 2MB. Formatos suportados: PNG, JPG, JPEG
          </Typography>
        </Paper>
      </motion.div>
    </Box>
  );
};
