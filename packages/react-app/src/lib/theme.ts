import {createTheme} from "@mui/material";

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFF',
    },
  },
  components: {
    MuiInput: {
      defaultProps: {
        disableUnderline: true,
      },
      styleOverrides: {
        root: {
          padding: '3px',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
        },
        input: {
          textAlign: 'center',
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
          borderRadius: '6px',
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
          background: '#6C69E9',
          color: '#FFF',
          '&:hover': {
            background: '#6C69E9',
          }
        }
      },
    },
  },
});

export default darkTheme;