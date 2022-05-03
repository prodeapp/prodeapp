import React, {useState} from "react";
import {useRanking} from "../../hooks/useRanking";
import {shortenAddress} from "@usedapp/core";
import {BoxWrapper, BoxRow} from "../../components"
import Button from '@mui/material/Button';
import AppDialog from "../Dialog";
import {Bet} from "../../graphql/subgraph";
import BetDetails from "../BetDetails";
import Alert from "@mui/material/Alert";
import {Link} from "react-router-dom";

export default function Ranking({tournamentId = '', playerId = ''}: {tournamentId?: string, playerId?: string}) {
  const { isLoading, error, data: ranking } = useRanking({tournamentId, playerId});
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
    return null
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  return <>
    {bet && <AppDialog
      open={openModal}
      handleClose={handleClose}
      title="Details"
    >
      <BetDetails bet={bet} />
    </AppDialog>}
    <BoxWrapper>
      <BoxRow>
        <div style={{width: '10%'}}>#</div>
        <div style={{width: '40%'}}>Player</div>
        <div style={{width: '40%'}}>Points</div>
        <div style={{width: '120px'}}></div>
      </BoxRow>
      {ranking && ranking.length === 0 && <Alert severity="info">No bets found.</Alert>}
      {ranking && ranking.length > 0 && ranking.map((rank, i) => {
        return <BoxRow key={i}>
          <div style={{width: '10%'}}>{i+1}</div>
          <div style={{width: '40%'}}><Link to={`/profile/${rank.player.id}`}>{shortenAddress(rank.player.id)}</Link></div>
          <div style={{width: '40%'}}>{rank.points.toString()}</div>
          <div style={{width: '120px'}}><Button onClick={() => handleOpen(rank)}>Details</Button></div>
        </BoxRow>
      })}
    </BoxWrapper>
  </>
}
