import React, {useState} from "react";
import {useRanking} from "../../hooks/useRanking";
import {shortenAddress, useEthers} from "@usedapp/core";
import {BoxWrapper, BoxRow} from "../../components"
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import AppDialog from "../Dialog";
import {Bet} from "../../graphql/subgraph";
import BetDetails from "../BetDetails";
import Alert from "@mui/material/Alert";
import {Link} from "react-router-dom";
import { Trans, t } from "@lingui/macro";
import { Skeleton } from "@mui/material";

export default function Bets({marketId}: {marketId: string}) {
  const {account} = useEthers();
  const { isLoading, error, data: ranking } = useRanking(marketId);
  const [openModal, setOpenModal] = useState(false);
  const [bet, setBet] = useState<Bet | undefined>();

  const handleOpen = (bet: Bet) => {
    setBet(bet);
    setOpenModal(true)
  }

  const handleClose = () => {
    setOpenModal(false);
  };

  if (isLoading) {
    return <Skeleton animation="wave" height={150}/>
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  return <>
    {bet && <AppDialog
      open={openModal}
      handleClose={handleClose}
      title={t`Details`}
    >
      <BetDetails bet={bet} />
    </AppDialog>}
    <BoxWrapper>
      <BoxRow>
        <div style={{width: '10%'}}>#</div>
        <div style={{width: '40%'}}><Trans>Player</Trans></div>
        <Box sx={{width: '40%', textAlign: {xs: 'center', sm: 'left'}}}><Trans>Points</Trans></Box>
        <div style={{width: '120px'}}></div>
      </BoxRow>
      {ranking && ranking.length === 0 && <Alert severity="info"><Trans>No bets found.</Trans></Alert>}
      {ranking && ranking.length > 0 && ranking.map((rank, i) => {
        return <BoxRow key={i}>
          <div style={{width: '10%'}}>{i+1}</div>
          <div style={{width: '40%'}}><Link to={`/profile/${rank.player.id}`}>{(account && rank.player.id.toLowerCase() === account.toLowerCase()) ? t`You` : shortenAddress(rank.player.id)}</Link></div>
          <Box sx={{width: '40%', textAlign: {xs: 'center', sm: 'left'}}}>{rank.points.toString()}</Box>
          <div style={{width: '120px'}}><Button onClick={() => handleOpen(rank)}><Trans>Details</Trans></Button></div>
        </BoxRow>
      })}
    </BoxWrapper>
  </>
}
