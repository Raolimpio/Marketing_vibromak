import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { ptBR } from '@mui/material/locale';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './config/firebase';
import { getAuth } from 'firebase/auth';

// Breakpoints seguindo padrões modernos de dispositivos
const BREAKPOINTS = {
  xs: 0,      // Phones (<600px)
  sm: 600,    // Tablets (≥600px)
  md: 900,    // Small laptops (≥900px)
  lg: 1200,   // Desktops (≥1200px)
  xl: 1536,   // Large desktops (≥1536px)
};

// Espaçamento base de 8px (padrão Material Design)
const SPACING = 8;

// Larguras de container otimizadas para leitura
const CONTAINER_WIDTH = {
  sm: 600,    // ~75 caracteres por linha
  md: 900,    // ~85 caracteres por linha
  lg: 1200,   // ~95 caracteres por linha
  xl: 1400,   // Máximo recomendado para legibilidade
};

// Cores padrão
const DEFAULT_COLORS = {
  primary: {
    main: '#2563eb',
    light: '#60a5fa',
    dark: '#1d4ed8',
    contrastText: '#fff',
  },
  secondary: {
    main: '#7c3aed',
    light: '#a78bfa',
    dark: '#5b21b6',
    contrastText: '#fff',
  },
  success: {
    main: '#059669',
    light: '#34d399',
    dark: '#047857',
    contrastText: '#fff',
  },
  error: {
    main: '#dc2626',
    light: '#f87171',
    dark: '#b91c1c',
    contrastText: '#fff',
  },
  warning: {
    main: '#d97706',
    light: '#fbbf24',
    dark: '#b45309',
    contrastText: '#fff',
  },
  info: {
    main: '#0284c7',
    light: '#38bdf8',
    dark: '#0369a1',
    contrastText: '#fff',
  },
  grey: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  background: {
    default: '#f9fafb',
    paper: '#ffffff',
  },
  text: {
    primary: '#111827',
    secondary: '#4b5563',
  },
  loginCardColor: '#ffffff',
  loginCardRadius: 4,
};

// Função auxiliar para ajustar cor
const adjustColor = (color: string, amount: number) => {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

// Função para carregar cores do Firestore
const loadThemeColors = async () => {
  try {
    // Verifica se há um usuário autenticado antes de tentar carregar o tema
    const auth = getAuth();
    if (!auth.currentUser) {
      return DEFAULT_COLORS;
    }

    const themeDoc = await getDoc(doc(db, 'settings', 'theme'));
    if (themeDoc.exists()) {
      const data = themeDoc.data();
      return {
        ...DEFAULT_COLORS,
        primary: {
          main: data.primaryColor || DEFAULT_COLORS.primary.main,
          light: adjustColor(data.primaryColor || DEFAULT_COLORS.primary.main, 40),
          dark: adjustColor(data.primaryColor || DEFAULT_COLORS.primary.main, -40),
          contrastText: '#fff',
        },
        secondary: {
          main: data.secondaryColor || DEFAULT_COLORS.secondary.main,
          light: adjustColor(data.secondaryColor || DEFAULT_COLORS.secondary.main, 40),
          dark: adjustColor(data.secondaryColor || DEFAULT_COLORS.secondary.main, -40),
          contrastText: '#fff',
        },
        success: {
          main: data.successColor || DEFAULT_COLORS.success.main,
          light: adjustColor(data.successColor || DEFAULT_COLORS.success.main, 40),
          dark: adjustColor(data.successColor || DEFAULT_COLORS.success.main, -40),
          contrastText: '#fff',
        },
        error: {
          main: data.errorColor || DEFAULT_COLORS.error.main,
          light: adjustColor(data.errorColor || DEFAULT_COLORS.error.main, 40),
          dark: adjustColor(data.errorColor || DEFAULT_COLORS.error.main, -40),
          contrastText: '#fff',
        },
        warning: {
          main: data.warningColor || DEFAULT_COLORS.warning.main,
          light: adjustColor(data.warningColor || DEFAULT_COLORS.warning.main, 40),
          dark: adjustColor(data.warningColor || DEFAULT_COLORS.warning.main, -40),
          contrastText: '#fff',
        },
        background: {
          default: data.backgroundColor || DEFAULT_COLORS.background.default,
          paper: data.menuColor || DEFAULT_COLORS.background.paper,
        },
        text: {
          primary: data.textColor || DEFAULT_COLORS.text.primary,
          secondary: adjustColor(data.textColor || DEFAULT_COLORS.text.secondary, -40),
        },
        loginCardColor: data.loginCardColor || DEFAULT_COLORS.loginCardColor,
        loginCardRadius: data.loginCardRadius || DEFAULT_COLORS.loginCardRadius,
      };
    }
  } catch (error) {
    console.error('Erro ao carregar cores do tema:', error);
  }
  return DEFAULT_COLORS;
};

// Função para criar tema
export const createAppTheme = async () => {
  const colors = await loadThemeColors();
  
  let theme = createTheme({
    palette: colors,
    breakpoints: {
      values: BREAKPOINTS,
    },
    spacing: SPACING,
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
        lineHeight: 1.2,
        color: colors.primary.main,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.3,
        color: colors.primary.main,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.3,
        color: colors.primary.main,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
        lineHeight: 1.4,
        color: colors.primary.main,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
        lineHeight: 1.4,
        color: colors.primary.main,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.4,
        color: colors.primary.main,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
        letterSpacing: '0.00938em',
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
        letterSpacing: '0.00714em',
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    components: {
      MuiContainer: {
        styleOverrides: {
          root: {
            paddingLeft: SPACING * 3,
            paddingRight: SPACING * 3,
            '@media (min-width: 600px)': {
              paddingLeft: SPACING * 4,
              paddingRight: SPACING * 4,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
            '&.MuiButton-contained': {
              backgroundColor: colors.primary.main,
              color: colors.primary.contrastText,
              '&:hover': {
                backgroundColor: colors.primary.dark,
              },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: colors.background.paper,
            color: colors.text.primary,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: colors.background.paper,
            color: colors.text.primary,
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              backgroundColor: `${colors.primary.main}20`,
              '&:hover': {
                backgroundColor: `${colors.primary.main}30`,
              },
            },
            '&:hover': {
              backgroundColor: `${colors.primary.main}10`,
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              backgroundColor: `${colors.primary.main}20`,
              '&:hover': {
                backgroundColor: `${colors.primary.main}30`,
              },
            },
            '&:hover': {
              backgroundColor: `${colors.primary.main}10`,
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: colors.background.paper,
            color: colors.text.primary,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: colors.grey[200],
          },
        },
      },
    },
  }, ptBR);

  theme = responsiveFontSizes(theme);

  return theme;
};

// Exportar tema padrão para uso inicial
export const theme = createTheme({
  palette: DEFAULT_COLORS,
  breakpoints: {
    values: BREAKPOINTS,
  },
  spacing: SPACING,
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: SPACING * 3,
          paddingRight: SPACING * 3,
          '@media (min-width: 600px)': {
            paddingLeft: SPACING * 4,
            paddingRight: SPACING * 4,
          },
        },
      },
    },
  },
}, ptBR);
