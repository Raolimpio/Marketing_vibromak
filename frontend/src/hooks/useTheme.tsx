import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getThemeSettings } from '../services/themeService';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { Box } from '@mui/material';

interface ThemeContextType {
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
  loginCardColor: string;
  loginCardRadius: number;
}

const defaultTheme: ThemeContextType = {
  primaryColor: '#1976d2',
  secondaryColor: '#dc004e',
  menuColor: '#ffffff',
  backgroundColor: '#f5f5f5',
  textColor: '#000000',
  buttonRadius: 4,
  cardRadius: 4,
  cardShadow: 'medium',
  successColor: '#4caf50',
  errorColor: '#f44336',
  warningColor: '#ff9800',
  tableBorder: true,
  tableStriped: true,
  menuSelected: 'rgba(0, 0, 0, 0.08)',
  menuHover: 'rgba(0, 0, 0, 0.04)',
  loginCardColor: '#ffffff',
  loginCardRadius: 4,
};

const ThemeContext = createContext<ThemeContextType>(defaultTheme);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeContextType>(() => {
    // Tentar carregar o tema do localStorage durante a inicialização
    const cachedTheme = localStorage.getItem('appTheme');
    if (cachedTheme) {
      try {
        return JSON.parse(cachedTheme) as ThemeContextType;
      } catch {
        return defaultTheme;
      }
    }
    return defaultTheme;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const settings = await getThemeSettings();
      if (settings) {
        setTheme(settings);
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
    } finally {
      setLoading(false);
    }
  };

  const muiTheme = createTheme({
    palette: {
      primary: {
        main: theme.primaryColor,
        contrastText: '#ffffff',
      },
      secondary: {
        main: theme.secondaryColor,
        contrastText: '#ffffff',
      },
      success: {
        main: theme.successColor,
      },
      error: {
        main: theme.errorColor,
      },
      warning: {
        main: theme.warningColor,
      },
      background: {
        default: theme.backgroundColor,
      },
      text: {
        primary: theme.textColor,
      },
    },
    shape: {
      borderRadius: theme.buttonRadius,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: theme.buttonRadius,
            textTransform: 'none',
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: theme.cardRadius,
            boxShadow: theme.cardShadow === 'light' 
              ? '0 2px 4px rgba(0,0,0,0.1)' 
              : theme.cardShadow === 'medium'
              ? '0 4px 8px rgba(0,0,0,0.15)'
              : '0 8px 16px rgba(0,0,0,0.2)',
          }
        }
      }
    }
  });

  // Adiciona um wrapper de loading para evitar flash de conteúdo
  if (loading) {
    return (
      <MuiThemeProvider theme={muiTheme}>
        <Box
          sx={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.backgroundColor,
          }}
        />
      </MuiThemeProvider>
    );
  }

  return (
    <ThemeContext.Provider value={theme}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  return useContext(ThemeContext);
};
