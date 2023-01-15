import React from 'react';
import { styled } from '@mui/material/styles';
import {Container, Typography} from "@mui/material";
import {Link as RouterLink, Link} from "react-router-dom";
import {BRIDGE_URL, getDocsUrl} from "../lib/helpers";
import {useI18nContext} from "../lib/I18nContext";
import {Trans} from "./Trans";
import {ReactComponent as Logo} from "../assets/logo.svg";

const FooterNav = styled('div', {
  shouldForwardProp: (prop) => prop !== 'ml',
})<{ml?: number}>(({ theme, ml }) => ({
  '& > div': {
    display: 'inline-block',
    '&+div': {
      marginLeft: theme.spacing(ml || 5),
    },
  },
  'a': {
    color: theme.palette.black.dark,
  },
}));

const FooterWrapper = styled('footer')(({ theme }) => ({
  background: theme.palette.secondary.main,

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

const FooterContainer = styled(Container)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    padding: '10px 0',
    '& > div': {
      marginTop: '10px',
    },
  },
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}));

const year = (new Date()).getUTCFullYear();

export default function Footer() {
  const { locale } = useI18nContext();

  return (
    <FooterWrapper>
      <div>
        <FooterContainer>
          <div style={{fontWeight: 500}}><Link to="/"><Logo /></Link></div>
          <FooterNav ml={2}>
            <div style={{fontWeight: 700}}><Trans>Follow us</Trans>:</div>
            <div><a href="http://twitter.com/prode_eth" target="_blank" rel="noreferrer">Twitter</a></div>
            <div><a href="https://t.me/prode_eth" target="_blank" rel="noreferrer">Telegram</a></div>
            <div><a href="http://github.com/prodeapp" target="_blank" rel="noreferrer">Github</a></div>
          </FooterNav>
        </FooterContainer>
      </div>
      <Typography component="div" variant="p3">
        <FooterContainer>
          <FooterNav>
            <div><RouterLink to='/markets/new'><Trans>Create Market</Trans></RouterLink></div>
            <div><a href={BRIDGE_URL} target="_blank" rel="noreferrer"><Trans>Bridge</Trans></a></div>
            <div><RouterLink to='/ads'><Trans>Ads</Trans></RouterLink></div>
            <div><a href={getDocsUrl(locale)} target="_blank" rel="noreferrer"><Trans>Documentation</Trans></a></div>
          </FooterNav>
          <div style={{color: '#7d7d7d'}}>
            Copyright &copy; {year} Prode.
          </div>
        </FooterContainer>
      </Typography>
    </FooterWrapper>
  );
}