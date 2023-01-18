import React, {useState} from "react";
import {useRanking} from "../../hooks/useRanking";
import {useEthers} from "@usedapp/core";
import {TableHeader, TableBody} from "../../components"
import Box from '@mui/material/Box';
import AppDialog from "../Dialog";
import {Bet} from "../../graphql/subgraph";
import BetDetails from "../Bet/BetDetails";
import Alert from "@mui/material/Alert";
import {Link} from "react-router-dom";
import { Trans } from '@lingui/react'
import { i18n } from "@lingui/core";
import { Skeleton } from "@mui/material";
import {useIndexedMarketWinners} from "../../hooks/useMarketWinners";
import {ReactComponent as EyeIcon} from "../../assets/icons/eye.svg";
import {ReactComponent as MedalIcon} from "../../assets/icons/medal.svg";
import {formatPlayerName, getMedalColor} from "../../lib/helpers";

export default function Bets({marketId, onlyMyBets}: {marketId: string, onlyMyBets?: boolean}) {
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
      title={i18n._("Details")}
    >
      <BetDetails bet={bet} />
    </AppDialog>}
    <div>
      <TableHeader>
        <div style={{width: '10%'}}>#</div>
        <div style={{width: '40%'}}><Trans id="Player" /></div>
        <Box sx={{width: '40%', textAlign: {xs: 'center', sm: 'left'}}}><Trans id="Points" /></Box>
        <div style={{width: '180px'}}><Trans id="Details" /></div>
      </TableHeader>
      {ranking && ranking.length === 0 && <Alert severity="info"><Trans id="No bets found." /></Alert>}
      {ranking && ranking.length > 0 && ranking.map((rank, i) => {
        if (onlyMyBets && account && rank.player.id.toLowerCase() !== account.toLowerCase()) {
          return null
        }

        return <TableBody key={i}>
          <div style={{width: '10%', display: 'flex'}}>
            <div>{i+1}</div>
            {marketWinners[rank.tokenID] && marketWinners[rank.tokenID].prizes.map((prize, i) => <MedalIcon style={{marginLeft: '10px', fill: getMedalColor(prize)}} key={i}/>)}
          </div>
          <div style={{width: '40%'}}><Link to={`/profile/${rank.player.id}`}>{(account && rank.player.id.toLowerCase() === account.toLowerCase()) ? i18n._("You") : formatPlayerName(rank.player.name, rank.player.id)}</Link></div>
          <Box sx={{width: '40%', textAlign: {xs: 'center', sm: 'left'}, fontWeight: 'bold'}}>{rank.points.toString()}</Box>
          <div style={{width: '180px'}}><span className="js-link" onClick={() => handleOpen(rank)}><EyeIcon /> <Trans id="See details" /></span></div>
        </TableBody>
      })}
    </div>
  </>
}
