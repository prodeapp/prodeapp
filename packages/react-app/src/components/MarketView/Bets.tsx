import React, {useState} from "react";
import {useRanking} from "../../hooks/useRanking";
import {shortenAddress, useEthers} from "@usedapp/core";
import {TableHeader, TableBody} from "../../components"
import Box from '@mui/material/Box';
import AppDialog from "../Dialog";
import {Bet} from "../../graphql/subgraph";
import BetDetails from "../Bet/BetDetails";
import Alert from "@mui/material/Alert";
import {Link} from "react-router-dom";
import { Trans, t } from "@lingui/macro";
import { Skeleton } from "@mui/material";
import {useIndexedMarketWinners} from "../../hooks/useMarketWinners";
import {ReactComponent as EyeIcon} from "../../assets/icons/eye.svg";
import {ReactComponent as MedalIcon} from "../../assets/icons/medal.svg";
import {getMedalColor} from "../../lib/helpers";

export default function Bets({marketId}: {marketId: string}) {
  const {account} = useEthers();
  const { isLoading, error, data: ranking } = useRanking(marketId);
  const marketWinners = useIndexedMarketWinners(marketId);
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
    <div>
      <TableHeader>
        <div style={{width: '10%'}}>#</div>
        <div style={{width: '40%'}}><Trans>Player</Trans></div>
        <Box sx={{width: '40%', textAlign: {xs: 'center', sm: 'left'}}}><Trans>Points</Trans></Box>
        <div style={{width: '180px'}}><Trans>Details</Trans></div>
      </TableHeader>
      {ranking && ranking.length === 0 && <Alert severity="info"><Trans>No bets found.</Trans></Alert>}
      {ranking && ranking.length > 0 && ranking.map((rank, i) => {
        return <TableBody key={i}>
          <div style={{width: '10%', display: 'flex'}}>
            <div>{i+1}</div>
            {marketWinners[rank.tokenID] && marketWinners[rank.tokenID].prizes.map(prize => <MedalIcon style={{marginLeft: '10px', fill: getMedalColor(prize)}} />)}
          </div>
          <div style={{width: '40%'}}><Link to={`/profile/${rank.player.id}`}>{(account && rank.player.id.toLowerCase() === account.toLowerCase()) ? t`You` : shortenAddress(rank.player.id)}</Link></div>
          <Box sx={{width: '40%', textAlign: {xs: 'center', sm: 'left'}, fontWeight: 'bold'}}>{rank.points.toString()}</Box>
          <div style={{width: '180px'}}><span className="js-link" onClick={() => handleOpen(rank)}><EyeIcon /> <Trans>See details</Trans></span></div>
        </TableBody>
      })}
    </div>
  </>
}
