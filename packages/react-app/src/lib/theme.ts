import {createTheme} from "@mui/material";
import ComfortaLightWoff from "../assets/fonts/comfortaa-light-webfont.woff";
import ComfortaRegularWoff from "../assets/fonts/comfortaa-regular-webfont.woff";
import ComfortaBoldWoff from "../assets/fonts/comfortaa-bold-webfont.woff";
import ComfortaLightWoff2 from "../assets/fonts/comfortaa-light-webfont.woff2";
import ComfortaRegularWoff2 from "../assets/fonts/comfortaa-regular-webfont.woff2";
import ComfortaBoldWoff2 from "../assets/fonts/comfortaa-bold-webfont.woff2";

const fonts = `@font-face {
    font-family: 'comfortaa';
    src: url('${ComfortaLightWoff2}') format('woff2'),
         url('${ComfortaLightWoff}') format('woff');
    font-weight: 300;
    font-style: normal;
}

@font-face {
    font-family: 'comfortaa';
    src: url('${ComfortaRegularWoff2}') format('woff2'),
         url('${ComfortaRegularWoff}') format('woff');
    font-weight: 400;
    font-style: normal;
}

@font-face {
    font-family: 'comforta';
    src: url('${ComfortaBoldWoff2}') format('woff2'),
         url('${ComfortaBoldWoff}') format('woff');
    font-weight: 700;
    font-style: normal;
}`

const palette = {
  primary: {
    light: '#4B75CC',
    main: '#4267B3',
    dark: '#385899',
    contrastText: '#FFF',
  },
  secondary: {
    light: '#FBF4E3',
    main: '#F1EAD8',
    dark: '#D9D2C2',
    contrastText: '#303030',
  },
  black: {
    light: '#969696',
    main: '#636363',
    dark: '#303030',
    contrastText: '#FFF',
  },
  error: {
    light: '#FF8788',
    main: '#F73A3B',
    dark: '#DE3435',
    contrastText: '#FFF',
  },
  success: {
    light: '#10C473',
    main: '#0EAB64',
    dark: '#0C9155',
    contrastText: '#FFF',
  },
  warning: {
    light: '#FADA34',
    main: '#FAD202',
    dark: '#E0BC02',
    contrastText: '#FFF',
  },
}

let theme = createTheme();

const darkTheme = createTheme({
  palette,
  typography: {
    fontFamily: `'Mulish',sans-serif`,
    h1: {
      fontFamily: 'comfortaa',
    },
    h2: {
      fontFamily: 'comfortaa',
    },
    h3: {
      fontFamily: 'comfortaa',
    },
    h4: {
      fontFamily: 'comfortaa',
    },
    h5: {
      fontFamily: 'comfortaa',
    },
    p1: {
      fontSize: '19.2px',
    },
    p2: {
      fontSize: '16px',
    },
    p3: {
      fontSize: '13.33px',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
            ${fonts}
            body {
              font-family: 'Mulish', sans-serif;
              background-color: ${palette.secondary.light};
              color: ${palette.black.dark};
            }
            h1 a, h2 a, h3 a, h4 a, h5 a {
              color: ${palette.black.dark};
            }
            a {
              color: ${palette.black.dark};
            }
            `,
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          background: palette.secondary.light,
        },
      },
      defaultProps: {
        color: 'transparent',
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          justifyContent: 'space-between',
          [theme.breakpoints.up('sm')]: {
            minHeight: '92px',
          },
        },
      },
    },
    MuiContainer: {
      defaultProps: {
        maxWidth: 'xl',
      },
    },
    MuiInput: {
      defaultProps: {
        disableUnderline: true,
      },
    },
    MuiOutlinedInput:{
      styleOverrides: {
        notchedOutline: {
          borderColor: palette.black.dark,
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
          backgroundColor: palette.secondary.main,
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
          textTransform: 'none',
        },
        contained: {
          borderRadius: 0,
        },
        sizeLarge: {
          paddingTop: '10.5px',
          paddingBottom: '10.5px',
        },
      },
    },
  },
});

export default darkTheme;