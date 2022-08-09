import {shortenAddress, useConfig, useContractFunction, useEthers, useLookupAddress} from "@usedapp/core";
import React, { useEffect, useState } from "react";
import { Toolbar, Container, Button, Box, AppBar, IconButton } from '@mui/material'
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
import {formatAmount, getDocsUrl, showWalletError} from "../lib/helpers";
import useWindowFocus from "../hooks/useWindowFocus";
import {styled} from "@mui/material/styles";
import { useLocation } from "react-router-dom";
import {ReactComponent as Logo} from "../assets/logo.svg";
import {ReactComponent as LogoutIcon} from "../assets/icons/logout.svg";
import {ReactComponent as DropdownArrow} from "../assets/icons/dropdown-down.svg";
import {Radio} from "./Radio";
import {useClaimArgs} from "../hooks/useReality";
import {Contract} from "@ethersproject/contracts";
import {RealityETH_v3_0__factory} from "../typechain";

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
        marginLeft: '50px',
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

const BRIDGE_URL = 'https://bridge.connext.network/?receivingChainId=100';
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
      <Container maxWidth="xl">
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
                <Trans>Create Market</Trans>
              </RouterLink>
              <a href={BRIDGE_URL} target="_blank" rel="noreferrer">
                <Trans>Bridge</Trans>
              </a>
              <a href={getDocsUrl(locale)} target="_blank" rel="noreferrer">
                <Trans>Documentation</Trans>
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

export interface DialogProps {
  open: boolean;
  handleClose: () => void;
}

function WalletDialog({open, handleClose}: DialogProps) {
  const { account, activate, activateBrowserWallet, error, switchNetwork } = useEthers();
  const { readOnlyUrls } = useConfig();
  const [walletError, setWalletError] = useState<Error | undefined>();
  const hasWindowFocus = useWindowFocus();

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
        if (hasWindowFocus) {
          // Ask to change the network in the wallet.
          switchNetwork(100)
        }
      } else {
        setWalletError(error)
      }
    }
  }, [error, walletError, switchNetwork, hasWindowFocus])

  return (
    <AppDialog
      open={open}
      handleClose={handleClose}
    >

      {walletError && <Alert severity="error">{showWalletError(walletError)}</Alert>}

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
  const {ens} = useLookupAddress(account);

  const {data: claimArgs} = useClaimArgs(account || '');

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

  const { state, send } = useContractFunction(
    new Contract(process.env.REACT_APP_REALITIO as string, RealityETH_v3_0__factory.createInterface()),
    'claimMultipleAndWithdrawBalance'
  );

  const claimReality = async () => {
    if (!claimArgs) {
      return;
    }

    await send(
      claimArgs.question_ids, claimArgs.answer_lengths, claimArgs.history_hashes, claimArgs.answerers, claimArgs.bonds, claimArgs.answers
    );
  }

  return <>
    <WalletDialog
      open={openWalletModal}
      handleClose={handleCloseWalletModal}
    />
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {!account && <Button onClick={handleOpenWalletModal} color="primary"><Trans>Connect Wallet</Trans></Button>}

      {state.status !== 'Success' && claimArgs && claimArgs.total.gt(0) && <Button onClick={claimReality} color="primary" style={{marginRight: 10}}><Trans>Claim</Trans> {formatAmount(claimArgs.total)}</Button>}

      {account && <>
        <RouterLink to={"/profile"} style={{display: 'flex', alignItems: 'center', marginRight: 10}}>
          <Blockies seed={account} size={7} scale={4} />
          <Box ml={1} sx={{display: {xs: 'none', md: 'block'}}}>{accountName}</Box>
        </RouterLink>
        <LogoutIcon onClick={deactivate} style={{cursor: 'pointer'}} />
      </>}
    </Box>
  </>
}