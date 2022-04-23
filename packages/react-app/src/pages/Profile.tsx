import { ExpandMoreOutlined } from '@mui/icons-material';
import { Typography, Container, Grid, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { useEthers } from '@usedapp/core';
import { Box, BoxRow } from '../components';
import { Bet } from '../graphql/subgraph';
import { usePlayer } from '../hooks/usePlayer';
import { formatAmount } from '../lib/helpers';


function getBetDetails(bet: Bet) {
  console.log(bet)
  let output = [];
  output.push(
    <BoxRow>
      <div style={{ width: '40%'}}>Your Bet</div>
      <div style={{ width: '40%'}}>Match Result</div>
      <div style={{ width: '20%' }}>Points Earned</div>
    </BoxRow>
  )
  for (let i = 0; i < bet.tournament.matches.length; i++) {
    // TODO: change result format
    let betresult = bet.results[i];
    let match = bet.tournament.matches[i];
    let matchresult = match.answer ? match.answer.answer : "Unknown";
    output.push(
      <BoxRow key={match.id}>
        <div style={{ width: '40%', wordBreak: 'break-word' }}>{betresult}</div>
        <div style={{ width: '40%', wordBreak: 'break-word' }}>{matchresult}</div>
        {/* TODO: If the points earned change with the tournament? */}
        <div style={{ width: '20%' }}>{betresult === matchresult ? "+1" : matchresult === "Unknown"? "Waiting result": "0"}</div>
      </BoxRow>
    )
    return output;
  }
}

export default function Profile() {
  const { account, error: errorWallet } = useEthers();
  const { data: player, error, isLoading } = usePlayer(String(account).toLowerCase());

  if (typeof (account) !== 'string') return <Typography variant='h5'>Please, connect your wallet</Typography>
  if (errorWallet) return <Typography variant='h5'>Error in the wallet provider</Typography>
  if (error) {
    return <Typography variant='h5'>Error...</Typography>
  }

  if (isLoading) {
    <Typography variant='h5'>Loading...</Typography>
  }
  if (!player) {
    return <Typography variant='h5'>User not found in the tournaments</Typography>
  }

  return (
    <Container>
      <Grid container columnSpacing={2} rowSpacing={1} sx={{ marginTop: '30px', justifyContent: 'center' }}>
        <Grid item sm={6} md={6} sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant='h5'>Total Bet: {formatAmount(player.amountBeted)}</Typography>
        </Grid>
        <Grid item sm={6} md={6} sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant='h5'>Total Rewards: {formatAmount(player.pricesReceived)}</Typography>
        </Grid>
      </Grid>
      <Grid container columnSpacing={2} rowSpacing={1} sx={{ marginTop: '30px' }}>
        <Grid item sm={12} md={12}>
          <BoxRow>
            <div style={{ width: '20%' }}>Token ID</div>
            <div style={{ width: '40%' }}>Tournament</div>
            <div style={{ width: '60%' }}>Points</div>
            <div style={{ width: '20%' }}>Reward</div>
          </BoxRow>

          {player.bets && player.bets.map(bet => {
            return (
              <Accordion id={bet.id} key={bet.id}>
                <AccordionSummary expandIcon={<ExpandMoreOutlined />} sx={{alignContent: 'center'}}>
                  <div style={{ width: '20%' }}>{bet.tokenID}</div>
                  <div style={{ width: '40%' }}><a href={'/tournaments/' + bet.tournament.id}>{bet.tournament.name}</a></div>
                  <div style={{ width: '20%' }}>{bet.points}</div>
                  <div style={{ width: '20%' }}>{formatAmount(bet.reward)}</div>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>{getBetDetails(bet)}</Box>
                </AccordionDetails>
              </Accordion>
            )
          })}
        </Grid>
      </Grid>

    </Container >
  );
}
