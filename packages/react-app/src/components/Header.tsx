import { getAccount } from '@wagmi/core'
import React, { useEffect, useState } from "react";
import { Toolbar, Container, Button, Box, AppBar, IconButton } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink } from "react-router-dom";
import { LocaleEnum } from "../lib/types";
import { useI18nContext } from "../lib/I18nContext";
import { Trans } from '@lingui/react';
import {BRIDGE_URL, formatAmount, getDocsUrl} from "../lib/helpers";
import {styled} from "@mui/material/styles";
import { useLocation } from "react-router-dom";
import {ReactComponent as Logo} from "../assets/logo.svg";
import {ReactComponent as DropdownArrow} from "../assets/icons/dropdown-down.svg";
import {Radio} from "./Radio";
import {useClaimArgs} from "../hooks/useReality";
import {useContractWrite, useNetwork} from "wagmi";
import {RealityAbi} from "../abi/RealityETH_v3_0";
import {Address} from "@wagmi/core"
import {ConnectButton} from "./ConnectButton";

const MenuBar = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  alignItems: 'center',
  display: 'none',
  marginLeft: '50px',

  'a': {
    fontSize: '19.2px',
    color: theme.palette.black.dark,
    fontWeight: 700,
    alignItems: 'center',
    display: 'flex',
    padding: '0 23px',
    '&:hover': {
      background: theme.palette.secondary.main,
    }
  },

  // mobile view
  [theme.breakpoints.down('md')]: {
    '&.mobile-open': {
      display: 'block',
      position: 'absolute',
      background: theme.palette.secondary.main,
      zIndex: 10,
      left: '-16px',
      right: '-16px',
      marginLeft: 0,
      color: 'black',
      top: '56px',

      '&>a': {
        flexDirection: 'column',
        padding: '10px 0',
      },
    },
  },

  // desktop view
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    '&>a': {
      height: '100%',
      '&+a': {
        marginLeft: '7px',
      },
    },
  },
}));

function DropdownMenu({text, children}: {text: string, children: React.ReactNode}) {
  const DropdownLink = styled('a')(({ theme }) => ({
    position: 'relative',
    cursor: 'pointer',
    '> div': {
      display: 'none',
      position: 'absolute',
      background: theme.palette.secondary.main,
      top: '100%',
      zIndex: 1,
      left: 0,
      minWidth: '100%',
      'span': {
        display: 'block',
        padding: '10px 23px 10px 50px',
        fontSize: '16px',
        cursor: 'pointer',
        position: 'relative',
        '&:before': {
          content: '""',
          width: '16px',
          height: '16px',
          display: 'block',
          border: `1px solid ${theme.palette.primary.main}`,
          borderRadius: '50%',
          position: 'absolute',
          left: '23px',
          top: '14px',
        },
        '&.active': {
          color: theme.palette.primary.main,
          fontWeight: 700,
          '&:before': {
            background: theme.palette.primary.main,
          },
        },
      },
    },
    'svg': {
      fill: theme.palette.primary.main,
    },
    '&:hover > div': {
      display: 'block',
    },
    '&:hover svg': {
      fill: theme.palette.black.dark,
      transform: 'rotate(180deg)',
    },
  }));

  return <DropdownLink className="dropdown-menu">
    <span>{text} <DropdownArrow style={{marginLeft: '6px'}}/></span>
    <div>{children}</div>
  </DropdownLink>
}

const languages: Record<string, string> = {[LocaleEnum.English]: 'English', [LocaleEnum.Spanish]: 'Español'};

export default function Header() {
  const { locale, handleChangeLocale } = useI18nContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleToggleNavMenu = () => {
    setMobileOpen(!mobileOpen);
  }

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  return (
    <AppBar position="static">
      <Container>
        <Toolbar disableGutters sx={{alignItems: 'stretch'}}>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleToggleNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
          </Box>
          <Box sx={{display: 'flex'}}>
            <RouterLink to="/" style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              <Logo />
            </RouterLink>
            <MenuBar className={mobileOpen ? 'mobile-open' : ''}>
              <RouterLink to='/markets/new'>
                <Trans id="Create Market" />
              </RouterLink>
              <a href={BRIDGE_URL} target="_blank" rel="noreferrer">
                <Trans id="Bridge" />
              </a>
              <RouterLink to='/ads'>
                <Trans id="Ads" />
              </RouterLink>
              <a href={getDocsUrl(locale)} target="_blank" rel="noreferrer">
                <Trans id="Documentation" />
              </a>
              <DropdownMenu text={languages[locale]}>
                {Object.keys(languages).map(lang => {
                  return <Radio key={lang} active={locale === lang} onClick={() => handleChangeLocale(lang as LocaleEnum)}>{languages[lang]}</Radio>
                })}
              </DropdownMenu>
            </MenuBar>
          </Box>
          <WalletMenu />
        </Toolbar>
      </Container>
    </AppBar>
    );
};

function WalletMenu() {
  const { chain } = useNetwork()
  const {address} = getAccount();

  const {data: claimArgs} = useClaimArgs(address || '');

  const { isSuccess, write } = useContractWrite({
    mode: 'recklesslyUnprepared',
    address: import.meta.env.VITE_REALITIO as Address,
    abi: RealityAbi,
    functionName: 'claimMultipleAndWithdrawBalance',
  })


  const claimReality = async () => {
    if (!claimArgs) {
      return;
    }

    await write!({
      recklesslySetUnpreparedArgs: [
        claimArgs.question_ids, claimArgs.answer_lengths, claimArgs.history_hashes, claimArgs.answerers, claimArgs.bonds, claimArgs.answers
      ]
    });
  }

  return <>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {chain && !chain.unsupported && !isSuccess && claimArgs && claimArgs.total.gt(0) && <Button onClick={claimReality} color="primary" style={{marginRight: 10}}><Trans id="Claim" /> {formatAmount(claimArgs.total)}</Button>}

      <ConnectButton />
    </Box>
  </>
}