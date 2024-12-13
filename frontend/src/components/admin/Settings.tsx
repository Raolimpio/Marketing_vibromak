import { useState } from 'react';
import { ThemeSettings } from './theme/ThemeSettings';
import { Paper, Box, Button, Container } from '@mui/material';

export default function Settings() {
  const [value, setValue] = useState(0);

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: '80vh' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Button 
            onClick={() => setValue(0)}
            variant={value === 0 ? "contained" : "text"}
            sx={{ mr: 1 }}
          >
            Geral
          </Button>
          <Button 
            onClick={() => setValue(1)}
            variant={value === 1 ? "contained" : "text"}
          >
            Tema
          </Button>
        </Box>
        
        {value === 0 && (
          <Box p={2}>
            <h2>Configurações gerais</h2>
            {/* Aqui vão as configurações gerais */}
          </Box>
        )}
        
        {value === 1 && <ThemeSettings />}
      </Paper>
    </Container>
  );
}
