import {createTheme} from "@mui/material";

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#fff',
    }
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
  },
});

export default darkTheme;