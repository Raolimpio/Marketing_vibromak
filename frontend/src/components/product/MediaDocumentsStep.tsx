import { Box, Typography, TextField, IconButton, Button, Alert, Grid, Card, CardContent, Link } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Link as LinkIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Document } from '../../types/Product';
import { itemVariants } from './animations';

interface MediaDocumentsStepProps {
  videos: Video[];
  documents: Document[];
  validationErrors: Record<string, string>;
  onVideoChange: (index: number, field: keyof Video, value: string) => void;
  onDocumentChange: (index: number, field: keyof Document, value: string) => void;
  onAddVideo: () => void;
  onRemoveVideo: (index: number) => void;
  onAddDocument: () => void;
  onRemoveDocument: (index: number) => void;
}

export default function MediaDocumentsStep({
  videos,
  documents,
  validationErrors,
  onVideoChange,
  onDocumentChange,
  onAddVideo,
  onRemoveVideo,
  onAddDocument,
  onRemoveDocument
}: MediaDocumentsStepProps) {
  return (
    <Box>
      {/* Seção de Vídeos */}
      <Box mb={4}>
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ 
            color: 'primary.main',
            fontWeight: 600,
            mb: 3
          }}
        >
          Vídeos
        </Typography>

        {validationErrors.videos && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: '12px'
            }}
          >
            {validationErrors.videos}
          </Alert>
        )}

        <AnimatePresence>
          {videos.map((video, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Card 
                sx={{ 
                  mb: 2,
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Título do Vídeo"
                        value={video.title}
                        onChange={(e) => onVideoChange(index, 'title', e.target.value)}
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="URL do Vídeo"
                        value={video.url}
                        onChange={(e) => onVideoChange(index, 'url', e.target.value)}
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton
                        color="error"
                        onClick={() => onRemoveVideo(index)}
                        sx={{
                          bgcolor: 'error.light',
                          color: 'error.main',
                          '&:hover': {
                            bgcolor: 'error.light',
                            transform: 'scale(1.1)',
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        <Button
          startIcon={<AddIcon />}
          onClick={onAddVideo}
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
      </Box>

      {/* Seção de Documentos */}
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
          Documentos
        </Typography>

        {validationErrors.documents && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: '12px'
            }}
          >
            {validationErrors.documents}
          </Alert>
        )}

        <AnimatePresence>
          {documents.map((document, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Card 
                sx={{ 
                  mb: 2,
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Título do Documento"
                        value={document.title}
                        onChange={(e) => onDocumentChange(index, 'title', e.target.value)}
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="URL do Documento"
                        value={document.url}
                        onChange={(e) => onDocumentChange(index, 'url', e.target.value)}
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton
                        color="error"
                        onClick={() => onRemoveDocument(index)}
                        sx={{
                          bgcolor: 'error.light',
                          color: 'error.main',
                          '&:hover': {
                            bgcolor: 'error.light',
                            transform: 'scale(1.1)',
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        <Button
          startIcon={<AddIcon />}
          onClick={onAddDocument}
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
      </Box>
    </Box>
  );
}
