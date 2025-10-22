import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3af062', // accent-green
      light: '#6ff38d',
      dark: '#2bc04d',
    },
    secondary: {
      main: '#1456ff', // chart-blue
      light: '#4d7dff',
      dark: '#0d3eb3',
    },
    background: {
      default: '#f5f6f6', // light-grey
      paper: '#ffffff', // white
    },
    text: {
      primary: '#15141d', // black
      secondary: '#15141d', // black
    },
    error: {
      main: '#ff81a1', // code-red
    },
    success: {
      main: '#4cb24a', // code-green
    },
    info: {
      main: '#947bf2', // code-purple
    },
    grey: {
      50: '#f5f6f6', // light-grey
      100: '#88869a', // grey
      200: '#666476', // dark-grey
      900: '#212028', // light-black
    },
  },
  typography: {
    fontFamily: '"Aeonik", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#15141d', // black
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#15141d', // black
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#15141d', // black
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#15141d', // black
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#15141d', // black
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#15141d', // black
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#15141d', // black
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 24px',
          fontSize: '1rem',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#3af062', // accent-green
          color: '#15141d', // black
          '&:hover': {
            backgroundColor: '#2bc04d', // darker accent-green
          },
        },
        outlinedPrimary: {
          borderColor: '#15141d', // black
          color: '#15141d', // black
          '&:hover': {
            borderColor: '#15141d', // black
            backgroundColor: 'rgba(21, 20, 29, 0.04)'
          }
        }
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0px 4px 6px rgba(21, 20, 29, 0.05)', // black with opacity
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid #f5f6f6', // light-grey
          backgroundColor: '#ffffff', // white
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#3af062', // accent-green
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#15141d', // black
          textDecoration: 'none',
          '&:hover': {
            color: '#3af062', // accent-green
          },
        },
      },
    },
  },
});

export default theme; 