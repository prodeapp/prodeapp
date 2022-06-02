import { ExpandMoreOutlined } from '@mui/icons-material';
import { Typography, Container, Grid, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { BoxRow } from '../components';
import {formatAmount} from '../lib/helpers';
import {useEthers} from "@usedapp/core";
import {usePlayer} from "../hooks/usePlayer";
import BetDetails from "../components/BetDetails";
import {useRanking} from "../hooks/useRanking";
import Alert from "@mui/material/Alert";
import * as React from "react";
import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";

export default function Profile() {
  const { id } = useParams();
  const { account, error: walletError } = useEthers();
  const [playerId, setPlayerId] = useState('');
  const { data: player } = usePlayer(String(account));
  const { data: bets, error, isLoading } = useRanking({playerId});

  useEffect(() => {
    setPlayerId(id || account || '')
  }, [id, account]);

  if (!account || walletError) {
    return <Alert severity="error">{walletError?.message || 'Connect your wallet to view your profile.'}</Alert>
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  if (isLoading) {
    return null
  }

  if (!bets || bets.length === 0) {
    return <Alert severity="error">No bets found.</Alert>
  }

  return (
    <Container>
      {player && <Grid container columnSpacing={2} rowSpacing={1} sx={{ marginTop: '30px', justifyContent: 'center' }}>
        <Grid item sm={6} md={6} sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant='h5'>Total Bet: {formatAmount(player.amountBet)}</Typography>
        </Grid>
        <Grid item sm={6} md={6} sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant='h5'>Total Rewards: {formatAmount(player.pricesReceived)}</Typography>
        </Grid>
      </Grid>}
      <Grid container columnSpacing={2} rowSpacing={1} sx={{ marginTop: '30px' }}>
        <Grid item sm={12} md={12}>
          <BoxRow>
            <div style={{ width: '20%' }}>Token ID</div>
            <div style={{ width: '40%' }}>Market</div>
            <div style={{ width: '60%' }}>Points</div>
            <div style={{ width: '20%' }}>Reward</div>
          </BoxRow>

          {bets && bets.map(bet => {
            return (
              <Accordion id={bet.id} key={bet.id}>
                <AccordionSummary expandIcon={<ExpandMoreOutlined />} sx={{alignContent: 'center'}}>
                  <div style={{ width: '20%' }}>{bet.tokenID}</div>
                  <div style={{ width: '40%' }}><a href={'/market/' + bet.market.id}>{bet.market.name}</a></div>
                  <div style={{ width: '20%' }}>{bet.points}</div>
                  <div style={{ width: '20%' }}>{formatAmount(bet.reward)}</div>
                </AccordionSummary>
                <AccordionDetails>
                  <BetDetails bet={bet} />
                </AccordionDetails>
              </Accordion>
            )
          })}
        </Grid>
      </Grid>

    </Container>
  )
}
