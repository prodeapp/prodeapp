import React from 'react';
import { styled } from '@mui/material/styles';
import {Container} from "@mui/material";
import {Link} from "react-router-dom";
import {getDocsUrl} from "../lib/helpers";
import {useI18nContext} from "../lib/I18nContext";
import {Trans} from "@lingui/macro";
import {ReactComponent as Logo} from "../assets/logo.svg";

const FooterNav = styled('div')(({ theme }) => ({
  '& > div': {
    display: 'inline-block',
    '&+div': {
      marginLeft: theme.spacing(5),
    },
  },
}));

const FooterWrapper = styled('footer')(({ theme }) => ({
  background: theme.palette.secondary.dark,

  '>div': {
    borderTop: `1px solid ${theme.palette.black.dark}`,
    minHeight: '52px',
    display: 'flex',
    alignItems: 'center',
  },

  [theme.breakpoints.down('md')]: {
    textAlign: 'center',
  },
}));


export default function Footer() {
  const { locale } = useI18nContext();

  return (
    <FooterWrapper>
      <div>
        <Container>
          <div style={{fontWeight: 500}}><Link to="/"><Logo /></Link></div>
        </Container>
      </div>
      <div>
        <Container>
          <FooterNav>
            <div><a href="http://twitter.com/prode_eth" target="_blank" rel="noreferrer">Twitter</a></div>
            <div><a href="http://github.com/prodeapp" target="_blank" rel="noreferrer">Github</a></div>
            <div><a href={getDocsUrl(locale)} target="_blank" rel="noreferrer"><Trans>Documentation</Trans></a></div>
          </FooterNav>
        </Container>
      </div>
    </FooterWrapper>
  );
}