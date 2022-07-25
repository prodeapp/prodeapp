import { shortenAddress, useConfig, useEthers, useLookupAddress } from "@usedapp/core";
import React, { useEffect, useState, MouseEvent } from "react";
import { Toolbar, Menu, Container, Button, MenuItem, Box, AppBar, IconButton, Link, Select } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu';
import Alert from "@mui/material/Alert";
import { Link as RouterLink } from "react-router-dom";
import AppDialog from "./Dialog";
import { ReactComponent as MetamaskIcon } from "../assets/metamask.svg";
import { ReactComponent as WalletConnectIcon } from "../assets/wallet-connect.svg";
import { xDai } from "@usedapp/core";
import WalletConnectProvider from '@walletconnect/web3-provider'
import Blockies from 'react-blockies';
import { LocaleEnum } from "../lib/types";
import { useI18nContext } from "../lib/I18nContext";
import { Trans } from "@lingui/macro";
import { Language } from "@mui/icons-material";

export default function AppMenuBar() {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const { locale, handleChangeLocale } = useI18nContext();

  const BRIDGE_URL = 'https://bridge.connext.network/?receivingChainId=100';
  const DOC_URL_EN = 'https://prode-eth.gitbook.io/prode.eth-en';
  const DOC_URL_ES = 'https://prode-eth.gitbook.io/prode.eth-es';

  const handleOpenNavMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  console.log(locale===LocaleEnum.Spanish?DOC_URL_ES:DOC_URL_EN);

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Link
            underline="none"
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
          >
            prode.eth
          </Link>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              <MenuItem>
                <Button component={RouterLink} to='/markets/new' onClick={handleCloseNavMenu}><Trans>Create Market</Trans></Button>
              </MenuItem>
              <MenuItem>
                <Button href={BRIDGE_URL} target="_blank" rel="noreferrer">Bridge</Button>
              </MenuItem>
              <MenuItem>
                <Button href={locale===LocaleEnum.Spanish?DOC_URL_ES:DOC_URL_EN} target="_blank" rel="noreferrer"><Trans>Doc</Trans></Button>
              </MenuItem>
              <MenuItem sx={{display: {alignItems: 'center'}}}>
                <Language />
                <Select value={locale} onChange={(e) => {
                  handleChangeLocale(e.target.value as LocaleEnum);
                  localStorage.setItem("locale", e.target.value as LocaleEnum)
                }}>
                  <MenuItem value={LocaleEnum.English}>English</MenuItem>
                  <MenuItem value={LocaleEnum.Spanish}>Español</MenuItem>
                </Select>
              </MenuItem>
            </Menu>
          </Box>
          <Link
            underline="none"
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}
          >
            prode.eth
          </Link>
          <Box sx={{ flexGrow: 1,display: { xs: 'none', md: 'flex'} }}>
            <Button
              onClick={handleCloseNavMenu}
              sx={{ my: 2, color: 'white', display: 'block' }}
              component={RouterLink} to='/markets/new'
            >
              <Trans>Create Market</Trans>
            </Button>
            <Button
              sx={{ my: 2, color: 'white', display: 'block' }}
              href={BRIDGE_URL} target="_blank" rel="noreferrer"
            >
              <Trans>Bridge</Trans>
            </Button>
            <Button
              sx={{ my: 2, color: 'white', display: 'block' }}
              href={locale===LocaleEnum.Spanish?DOC_URL_ES:DOC_URL_EN} target="_blank" rel="noreferrer">
              <Trans>Documentation</Trans>
            </Button>
          </Box>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex', alignItems: 'center'} }}>
            <Language />
            <Select defaultValue={locale} onChange={(e) => {
              handleChangeLocale(e.target.value as LocaleEnum)
            }}>
              <MenuItem value={LocaleEnum.English}>English</MenuItem>
              <MenuItem value={LocaleEnum.Spanish}>Español</MenuItem>
            </Select>
          </Box>
          <WalletMenu />
        </Toolbar>
      </Container>
    </AppBar>
    );
};

export interface DialogProps {
  open: boolean;
  handleClose: () => void;
}

function WalletDialog({open, handleClose}: DialogProps) {
  const { account, activate, activateBrowserWallet, error, switchNetwork } = useEthers();
  const { readOnlyUrls } = useConfig();
  const [walletError, setWalletError] = useState<Error | undefined>();

  async function activateWalletConnect() {
    try {
      const provider = new WalletConnectProvider({
        rpc: {
          [xDai.chainId]: readOnlyUrls![xDai.chainId] as string,
        },
      })
      await provider.enable()
      await activate(provider)
    } catch (error) {
      setWalletError(error as Error)
    }
  }

  useEffect(() => {
    if (account) {
      handleClose();
    }
  }, [account, handleClose])

  useEffect(() => {
    if (error && error.message !== walletError?.message) {
      if (error.message.includes('Unsupported chain id')) {
        // Ask to change the network in the wallet.
        switchNetwork(100)
      } else {
        setWalletError(error)
      }
    }
  }, [error, walletError, switchNetwork])

  return (
    <AppDialog
      open={open}
      handleClose={handleClose}
    >

      {walletError && <Alert severity="error">{walletError.message}</Alert>}

      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: 50, cursor: 'pointer' }} onClick={activateBrowserWallet}>
          <MetamaskIcon width={100} />
          <div style={{ marginTop: 10 }}><Trans>Connect with your MetaMask Wallet</Trans></div>
        </div>
        <div onClick={activateWalletConnect} style={{ cursor: 'pointer' }}>
          <WalletConnectIcon width={100} />
          <div style={{ marginTop: 10 }}><Trans>Scan with WalletConnect to connect</Trans></div>
        </div>
      </div>
    </AppDialog>
  );
}

function WalletMenu() {
  const [accountName, setAccountName] = useState("");
  const [openWalletModal, setOpenWalletModal] = useState(false);

  const { account, deactivate } = useEthers();
  const {ens  } = useLookupAddress(account);

  useEffect(() => {
    if (ens) {
      setAccountName(ens);
    } else if (account) {
      setAccountName(shortenAddress(account));
    } else {
      setAccountName("");
    }
  }, [account, ens, setAccountName]);

  const handleOpenWalletModal = () => {
    setOpenWalletModal(true);
  };

  const handleCloseWalletModal = () => {
    setOpenWalletModal(false);
  };

  return <>
    <WalletDialog
      open={openWalletModal}
      handleClose={handleCloseWalletModal}
    />
    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 0 }}>
      {!account && <Button onClick={handleOpenWalletModal}><Trans>Connect Wallet</Trans></Button>}

      {account && <>
        <Blockies seed={account} size={7} scale={4} />
        <Button variant="text">{accountName}</Button>
        <Button component={RouterLink} to={"/profile"}><Trans>Profile</Trans></Button>
        <Button onClick={deactivate}><Trans>Logout</Trans></Button>
      </>}
    </Box>
  </>
}