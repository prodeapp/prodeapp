import { ExpandMoreOutlined } from '@mui/icons-material';
import { Typography, Container, Grid, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { Box, BoxRow } from '../components';
import {formatAmount} from '../lib/helpers';
import {useEthers} from "@usedapp/core";
import {usePlayerBets} from "../hooks/usePlayerBets";
import {usePlayer} from "../hooks/usePlayer";
import BetDetails from "../components/BetDetails";

export default function Profile() {
  const { account, error: errorWallet } = useEthers();
  const { data: player } = usePlayer(String(account));
  const { data: bets, error, isLoading } = usePlayerBets(String(account));

  if (!account) {
    return <Typography variant='h5'>Please, connect your wallet</Typography>
  }
  if (errorWallet) {
    return <Typography variant='h5'>Error in the wallet provider</Typography>
  }
  if (error) {
    return <Typography variant='h5'>Error...</Typography>
  }
  if (isLoading) {
    return <Typography variant='h5'>Loading...</Typography>
  }

  return (
    <Container>
      {player && <Grid container columnSpacing={2} rowSpacing={1} sx={{ marginTop: '30px', justifyContent: 'center' }}>
        <Grid item sm={6} md={6} sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant='h5'>Total Bet: {formatAmount(player.amountBeted)}</Typography>
        </Grid>
        <Grid item sm={6} md={6} sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant='h5'>Total Rewards: {formatAmount(player.pricesReceived)}</Typography>
        </Grid>
      </Grid>}
      <Grid container columnSpacing={2} rowSpacing={1} sx={{ marginTop: '30px' }}>
        <Grid item sm={12} md={12}>
          <BoxRow>
            <div style={{ width: '20%' }}>Token ID</div>
            <div style={{ width: '40%' }}>Tournament</div>
            <div style={{ width: '60%' }}>Points</div>
            <div style={{ width: '20%' }}>Reward</div>
          </BoxRow>

          {bets && bets.map(bet => {
            return (
              <Accordion id={bet.id} key={bet.id}>
                <AccordionSummary expandIcon={<ExpandMoreOutlined />} sx={{alignContent: 'center'}}>
                  <div style={{ width: '20%' }}>{bet.tokenID}</div>
                  <div style={{ width: '40%' }}><a href={'/tournaments/' + bet.tournament.id}>{bet.tournament.name}</a></div>
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
