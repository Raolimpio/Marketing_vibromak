import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface ThemePreviewProps {
  primaryColor: string;
  secondaryColor: string;
  menuColor: string;
  backgroundColor: string;
  textColor: string;
  logo?: string;
  buttonRadius: number;
  cardRadius: number;
  cardShadow: 'light' | 'medium' | 'strong';
  successColor: string;
  errorColor: string;
  warningColor: string;
  tableBorder: boolean;
  tableStriped: boolean;
  menuSelected: string;
  menuHover: string;
}

// Função auxiliar para verificar se uma cor é válida
const isValidColor = (color: string): boolean => {
  if (!color) return false;
  const s = new Option().style;
  s.color = color;
  return s.color !== '';
};

// Função para obter cor de contraste segura
const getContrastTextColor = (color: string): string => {
  if (!isValidColor(color)) return '#000000';
  // Converte a cor para RGB e calcula a luminosidade
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

const getShadow = (level: 'light' | 'medium' | 'strong') => {
  switch (level) {
    case 'light':
      return '0 1px 3px 0 rgb(0 0 0 / 0.1)';
    case 'medium':
      return '0 4px 6px -1px rgb(0 0 0 / 0.1)';
    case 'strong':
      return '0 10px 15px -3px rgb(0 0 0 / 0.1)';
  }
};

export const ThemePreview: React.FC<ThemePreviewProps> = ({
  primaryColor,
  secondaryColor,
  menuColor,
  backgroundColor,
  textColor,
  logo,
  buttonRadius,
  cardRadius,
  cardShadow,
  successColor,
  errorColor,
  warningColor,
  tableBorder,
  tableStriped,
  menuSelected,
  menuHover,
}) => {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        sx={{
          p: 2,
          border: '1px solid',
          borderColor: theme.palette.divider,
          borderRadius: cardRadius,
          overflow: 'hidden',
          backgroundColor: backgroundColor,
          color: textColor,
          boxShadow: getShadow(cardShadow),
        }}
      >
        <Typography variant="h6" gutterBottom>
          Preview
        </Typography>

        {/* Menu Preview */}
        <Paper
          sx={{
            p: 2,
            mb: 2,
            backgroundColor: menuColor,
            borderRadius: cardRadius,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            '& .menu-item': {
              p: 1,
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: menuHover,
              },
              '&.selected': {
                backgroundColor: menuSelected,
              },
            },
          }}
        >
          {logo && (
            <Box
              component="img"
              src={logo}
              alt="Logo Preview"
              sx={{
                height: '40px',
                objectFit: 'contain',
              }}
            />
          )}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box className="menu-item selected">
              <Typography>Item Selecionado</Typography>
            </Box>
            <Box className="menu-item">
              <Typography>Item do Menu</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Botões */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Botões
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
            >
              Botão Primário
            </Button>
            <Button
              variant="contained"
              color="secondary"
            >
              Botão Secundário
            </Button>
          </Box>
        </Box>

        {/* Status */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Status
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label="Sucesso"
              sx={{
                backgroundColor: successColor,
                color: getContrastTextColor(successColor),
                borderRadius: buttonRadius,
              }}
            />
            <Chip
              label="Erro"
              sx={{
                backgroundColor: errorColor,
                color: getContrastTextColor(errorColor),
                borderRadius: buttonRadius,
              }}
            />
            <Chip
              label="Alerta"
              sx={{
                backgroundColor: warningColor,
                color: getContrastTextColor(warningColor),
                borderRadius: buttonRadius,
              }}
            />
          </Box>
        </Box>

        {/* Tabela */}
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Tabela
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ borderBottom: tableBorder ? undefined : 'none' }}>
                    Nome
                  </TableCell>
                  <TableCell sx={{ borderBottom: tableBorder ? undefined : 'none' }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ borderBottom: tableBorder ? undefined : 'none' }}>
                    Ações
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {['Item 1', 'Item 2', 'Item 3'].map((item, index) => (
                  <TableRow
                    key={item}
                    sx={{
                      backgroundColor: tableStriped && index % 2 === 1 ? 'rgba(0, 0, 0, 0.02)' : 'inherit',
                    }}
                  >
                    <TableCell sx={{ borderBottom: tableBorder ? undefined : 'none' }}>
                      {item}
                    </TableCell>
                    <TableCell sx={{ borderBottom: tableBorder ? undefined : 'none' }}>
                      Ativo
                    </TableCell>
                    <TableCell sx={{ borderBottom: tableBorder ? undefined : 'none' }}>
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    </motion.div>
  );
};
