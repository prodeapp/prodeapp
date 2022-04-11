import { shortenAddress, useEthers, useLookupAddress } from "@usedapp/core";
import { useEffect, useState, MouseEvent } from "react";

import { Toolbar, Menu, Container, Button, Tooltip, MenuItem, Box, AppBar, IconButton, Link } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink } from "react-router-dom";

export default function AppMenuBar() {
    const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  
    const handleOpenNavMenu = (event: MouseEvent<HTMLElement>) => {
      setAnchorElNav(event.currentTarget);
    };
  
    const handleCloseNavMenu = () => {
      setAnchorElNav(null);
    };
  
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
              Tournaments App
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
                <MenuItem key='tournaments'>
                  <Button component={RouterLink} to='/tournaments' onClick={handleCloseNavMenu}>Tournaments</Button>
                </MenuItem>
                <MenuItem key='leaderboard'>
                  <Button component={RouterLink} to='/leaderboard' onClick={handleCloseNavMenu}>Leaderboard</Button>
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
              LOGO
            </Link>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              <Button
                key="tournament"
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
                component={RouterLink} to='/tournaments'
              >
                Tournaments
              </Button>
              <Button
                key="leaderboard"
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
                component={RouterLink} to='/leaderboard'
              >
                Leaderboard
              </Button>
            </Box>
            <WalletMenu />
          </Toolbar>
        </Container>
      </AppBar>
    );
  };
  
  function WalletMenu() {
    const [rendered, setRendered] = useState("");
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  
    const handleCloseUserMenu = () => {
      setAnchorElUser(null);
    };
    const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
      setAnchorElUser(event.currentTarget);
    };
  
    const ens = useLookupAddress();
    const { account, activateBrowserWallet, deactivate, error } = useEthers();
  
    useEffect(() => {
      if (ens) {
        setRendered(ens);
      } else if (account) {
        setRendered(shortenAddress(account));
      } else {
        setRendered("");
      }
    }, [account, ens, setRendered]);
  
    useEffect(() => {
      if (error) {
        console.error("Error while connecting wallet:", error.message);
      }
    }, [error]);
  
    return (
      <Box sx={{ flexGrow: 0 }}>
        <Tooltip title="Open settings">
          <Button onClick={typeof (account) !== 'string' ? activateBrowserWallet : handleOpenUserMenu} sx={{ p: 0 }}>
            {rendered === "" ?
              "Connect Wallet" :
              rendered
            }
  
          </Button>
        </Tooltip>
        {typeof (account) === 'string' ?
          <Menu
            sx={{ mt: '45px' }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            <MenuItem key="profile" onClick={handleCloseUserMenu}>
              <Link component={RouterLink} to={"/profile"} textAlign="center">Profile</Link>
            </MenuItem>
            <MenuItem key="logout" onClick={handleCloseUserMenu}>
              <Link onClick={deactivate} textAlign="center">Logout</Link>
            </MenuItem>
  
          </Menu>
          :
          null}
      </Box>
  
  
    );
  }