import { Box, Typography, Grid, TextField, Card, CardMedia, Avatar } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { itemVariants } from './animations';

interface ImageDescriptionStepProps {
  product: {
    description: string;
  };
  imagePreview: string | null;
  validationErrors: Record<string, string>;
  onDrop: (acceptedFiles: File[]) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ImageDescriptionStep({
  product,
  imagePreview,
  validationErrors,
  onDrop,
  onChange
}: ImageDescriptionStepProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  });

  return (
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
            onChange={onChange}
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
  );
}
