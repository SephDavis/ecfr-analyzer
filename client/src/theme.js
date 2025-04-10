// theme.js
import { createTheme } from '@mui/material/styles';

// Define a futuristic color palette
const colors = {
  primary: {
    main: '#3a7bd5',
    light: '#5e9cf5',
    dark: '#0d47a1',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#00c8aa',
    light: '#5effe8',
    dark: '#007c7c',
    contrastText: '#ffffff',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
    raised: '#252525',
    card: '#2d2d2d',
  },
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(255, 255, 255, 0.5)',
  },
  action: {
    active: '#ffffff',
    hover: 'rgba(255, 255, 255, 0.08)',
    selected: 'rgba(255, 255, 255, 0.16)',
  },
  chart: [
    '#3a7bd5', // primary
    '#00c8aa', // secondary
    '#e64a19', // orange
    '#9c27b0', // purple
    '#ffc107', // amber
    '#5e35b1', // deep purple
    '#00acc1', // cyan
    '#ffab00', // amber accent
    '#d500f9', // purple accent
  ],
};

// Create a theme with futuristic design elements
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    text: colors.text,
    action: colors.action,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '3rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.raised,
          backgroundImage: 'linear-gradient(90deg, rgba(58,123,213,0.1) 0%, rgba(0,200,170,0.1) 100%)',
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.5)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.card,
          backgroundImage: 'linear-gradient(135deg, rgba(58,123,213,0.05) 0%, rgba(0,0,0,0) 100%)',
          boxShadow: '0 8px 16px 0 rgba(0,0,0,0.3)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(135deg, rgba(58,123,213,0.03) 0%, rgba(0,0,0,0) 100%)',
          boxShadow: '0 8px 16px 0 rgba(0,0,0,0.3)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '8px 16px',
        },
        contained: {
          boxShadow: '0 4px 14px 0 rgba(0,0,0,0.3)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.primary.main,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: colors.background.raised,
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;
export { colors };