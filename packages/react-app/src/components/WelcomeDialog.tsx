import React, {useEffect, useState} from "react";
import Button from '@mui/material/Button';
import AppDialog from "../components/Dialog";
import { Trans, t } from "@lingui/macro";
import {useEtherBalance, useEthers} from "@usedapp/core";
import Link from "@mui/material/Link";
import {BRIDGE_URL} from "../lib/helpers";

function WelcomeDialog() {
  const {account} = useEthers();
  const balance = useEtherBalance(account);

  const [alreadyOpened, setAlreadyOpened] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(balance === undefined ? false : balance.eq(0));
  }, [balance])

  const handleClose = () => {
    setAlreadyOpened(true);
    setOpen(false);
  }

  return <AppDialog
    open={!alreadyOpened && open}
    handleClose={handleClose}
    title={t`Hey! Welcome to Prode`}
  >
    <div style={{marginBottom: 15}}><Trans>It looks like you have 0 xDAI in your wallet.</Trans></div>
    <div style={{marginBottom: 15}}><Trans>xDAI is the native token of Gnosis Chain, and the one used to place bets in the markets.</Trans></div>
    <div style={{marginBottom: 15}}><Trans>xDAI is bridged DAI, so if you have DAI in any other network (Ethereum Mainnet, Arbitrum, Optimism, etc.), you can use the bridge to transfer some of it to Gnosis Chain.</Trans></div>
    <div style={{marginBottom: 15}}><Trans>If first you want to take a look around, you can access the bridge later from the link in the main menu.</Trans></div>
    <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
      <Button color="primary" size="large" component={Link} href={BRIDGE_URL} target="_blank" rel="noopener"><Trans>Go to the bridge</Trans></Button>
      <Button color="primary" size="large" variant="outlined" onClick={handleClose}><Trans>Close and bridge later</Trans></Button>
    </div>
  </AppDialog>
}

export default WelcomeDialog;
