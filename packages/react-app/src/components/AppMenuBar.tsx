import { shortenAddress, useEthers, useLookupAddress } from "@usedapp/core";
import React, { useEffect, useState, MouseEvent } from "react";
import { Toolbar, Menu, Container, Button, MenuItem, Box, AppBar, IconButton, Link } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu';
import Alert from "@mui/material/Alert";
import { Link as RouterLink } from "react-router-dom";
import AppDialog from "./Dialog";
import { ReactComponent as MetamaskIcon } from "../assets/metamask.svg";
import { ReactComponent as WalletConnectIcon } from "../assets/wallet-connect.svg";
import { xDai } from "@usedapp/core";
import WalletConnectProvider from '@walletconnect/web3-provider'
import Blockies from 'react-blockies';

export default function AppMenuBar() {
    const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  
    const handleOpenNavMenu = (event: MouseEvent<HTMLElement>) => {
      setAnchorElNav(event.currentTarget);
    };
  
    const handleCloseNavMenu = () => {
      setAnchorElNav(null);
    };

    return (<>
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
                  <Button component={RouterLink} to='/markets/new' onClick={handleCloseNavMenu}>Create Market</Button>
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
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              <Button
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
                component={RouterLink} to='/markets/new'
              >
                Create Market
              </Button>
            </Box>
            <WalletMenu />
          </Toolbar>
        </Container>
      </AppBar>
    </>);
  };

export interface DialogProps {
  open: boolean;
  handleClose: () => void;
}

function WalletDialog({open, handleClose}: DialogProps) {
  const { account, activate, activateBrowserWallet, error } = useEthers();
  const [walletError, setWalletError] = useState<Error | undefined>();

  async function activateWalletConnect() {
    try {
      const provider = new WalletConnectProvider({
        rpc: {
          [xDai.chainId]: 'https://rpc.gnosischain.com',
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
    setWalletError(error)
  }, [error])

  return (
    <AppDialog
      open={open}
      handleClose={handleClose}
    >

      {walletError && <Alert severity="error">{walletError.message}</Alert>}

      <div style={{textAlign: 'center'}}>
        <div style={{marginBottom: 50, cursor: 'pointer'}} onClick={activateBrowserWallet}>
          <MetamaskIcon width={100} />
          <div style={{marginTop: 10}}>Connect with your MetaMask Wallet</div>
        </div>
        <div onClick={activateWalletConnect} style={{cursor: 'pointer'}}>
          <WalletConnectIcon width={100} />
          <div style={{marginTop: 10}}>Scan with WalletConnect to connect</div>
        </div>
      </div>
    </AppDialog>
  );
}

function WalletMenu() {
  const [accountName, setAccountName] = useState("");
  const [openWalletModal, setOpenWalletModal] = useState(false);

  const ens = useLookupAddress();
  const { account, deactivate } = useEthers();

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
      {!account && <Button onClick={handleOpenWalletModal}>Connect Wallet</Button>}

      {account && <>
        <Blockies seed={account} size={7} scale={4}/>
        <Button variant="text">{accountName}</Button>
        <Button component={RouterLink} to={"/profile"}>Profile</Button>
        <Button onClick={deactivate}>Logout</Button>
      </>}
    </Box>
  </>
}