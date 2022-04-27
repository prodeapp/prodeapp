import React, {useState} from "react";
import {useRanking} from "../../hooks/useRanking";
import {shortenAddress} from "@usedapp/core";
import {AlertError, Box, BoxRow} from "../../components"
import Button from '@mui/material/Button';
import AppDialog from "../Dialog";
import {Bet} from "../../graphql/subgraph";
import BetDetails from "../BetDetails";

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
    return <AlertError>{error}</AlertError>
  }

  return <>
    {bet && <AppDialog
      open={openModal}
      handleClose={handleClose}
      title="Details"
    >
      <BetDetails bet={bet} />
    </AppDialog>}
    <Box>
      <BoxRow>
        <div style={{width: '10%'}}>#</div>
        <div style={{width: '40%'}}>Player</div>
        <div style={{width: '40%'}}>Points</div>
        <div style={{width: '10%'}}></div>
      </BoxRow>
      {ranking && ranking.map((rank, i) => {
        return <BoxRow key={i}>
          <div style={{width: '10%'}}>{i+1}</div>
          <div style={{width: '40%'}}>{shortenAddress(rank.player.id)}</div>
          <div style={{width: '40%'}}>{rank.points.toString()}</div>
          <div style={{width: '10%'}}><Button onClick={() => handleOpen(rank)}>Details</Button></div>
        </BoxRow>
      })}
    </Box>
  </>
}
