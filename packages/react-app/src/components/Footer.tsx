import React from 'react';
import { styled } from '@mui/material/styles';
import {Box, Container} from "@mui/material";
import {Link} from "react-router-dom";
import {getDocsUrl} from "../lib/helpers";
import {useI18nContext} from "../lib/I18nContext";
import {Trans} from "@lingui/macro";

const FooterNav = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  marginRight: 'auto',
  marginLeft: theme.spacing(3),
  marginBottom: theme.spacing(0),

  // eslint-disable-next-line
  ['& > div']: {
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
      marginBottom: theme.spacing(2),
    }
  },

  [theme.breakpoints.down('md')]: {
    width: '100%',
    marginLeft: 'auto',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
}));

const FooterWrapper = styled('footer')(({ theme }) => ({
  background: theme.palette.background.default,
  marginTop: theme.spacing(3),
}));

const Root = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    justifyContent: 'center',
  },
}));

export default function Footer() {
  const { locale } = useI18nContext();

  return (
    <FooterWrapper>
      <Container maxWidth="lg">
        <Root py={3} display="flex" flexWrap="wrap" alignItems="center">
          <div style={{fontWeight: 500}}><Link to="/">prode.eth</Link></div>
          <FooterNav>
            <div><a href="http://twitter.com/prode_eth" target="_blank" rel="noreferrer">Twitter</a></div>
            <div><a href="http://github.com/prodeapp" target="_blank" rel="noreferrer">Github</a></div>
            <div><a href={getDocsUrl(locale)} target="_blank" rel="noreferrer"><Trans>Documentation</Trans></a></div>
          </FooterNav>
        </Root>
      </Container>
    </FooterWrapper>
  );
}