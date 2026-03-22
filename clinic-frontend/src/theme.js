import { extendTheme } from '@mui/joy/styles';

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          50: '#edf2f4',
          100: '#d0d9e0',
          200: '#b3c0cc',
          300: '#8d99ae',
          400: '#6d7d8e',
          500: '#2b2d42',
          600: '#252738',
          700: '#1e202e',
          800: '#181924',
          900: '#11121a',
          solidBg: '#2b2d42',
          solidHoverBg: '#3d3f57',
          solidActiveBg: '#1e202e',
          outlinedBorder: '#8d99ae',
          outlinedColor: '#2b2d42',
          outlinedHoverBg: '#edf2f4',
          softBg: '#edf2f4',
          softColor: '#2b2d42',
          softHoverBg: '#d0d9e0',
        },
        neutral: {
          50: '#edf2f4',
          100: '#d0d9e0',
          200: '#b3c0cc',
          300: '#8d99ae',
          400: '#6d7d8e',
          500: '#4e5d6e',
          600: '#3d4a58',
          700: '#2c3642',
          800: '#1b232c',
          900: '#0a1016',
        },
        background: {
          body: '#edf2f4',
          surface: '#ffffff',
          popup: '#ffffff',
          level1: '#edf2f4',
          level2: '#d0d9e0',
          level3: '#b3c0cc',
        },
        text: {
          primary: '#2b2d42',
          secondary: '#8d99ae',
          tertiary: '#b3c0cc',
        },
      },
    },
  },
  typography: {
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#2b2d42',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#2b2d42',
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#2b2d42',
    },
    'body-md': {
      color: '#2b2d42',
    },
    'body-sm': {
      color: '#8d99ae',
    },
  },
  components: {
    JoyButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 600,
        },
      },
    },
    JoyCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(43, 45, 66, 0.08)',
          backgroundColor: '#ffffff',
        },
      },
    },
    JoyInput: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    JoyChip: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
        },
      },
    },
  },
});

export default theme;