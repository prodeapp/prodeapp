import {createTheme} from "@mui/material";

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFF',
    },
    secondary: {
      main: '#4267B3',
    }
  },
  components: {
    MuiInput: {
      defaultProps: {
        disableUnderline: true,
      },
    },
    MuiOutlinedInput:{
      styleOverrides: {
        notchedOutline: {
          borderColor: '#e2e8f0',
          borderRadius: '6px',
        },
        input: {
          padding: '8.5px 14px',
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '.MuiOutlinedInput-root': {
            padding: 0,
          },
          '.MuiOutlinedInput-root .MuiAutocomplete-input': {
            padding: '8.5px 14px',
          }
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          height: '28px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        root: {
          backgroundColor: '#000',
        },
        paper: {
          backgroundColor: '#15171A',
          backgroundImage: 'none',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '0 24px 20px 24px',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        variant: 'contained',
        color: 'primary',
      },
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
        contained: {
          borderRadius: 0,
          '&:hover': {
            opacity: 0.75,
          },
        },
        containedPrimary: {
          background: '#121212',
          color: '#FFF',
          border: '1px solid #272727',
          '&:hover': {
            background: '#15171A',
          },
        },
        containedSecondary: {
          color: '#FFF',
        }
      },
    },
  },
});

export default darkTheme;