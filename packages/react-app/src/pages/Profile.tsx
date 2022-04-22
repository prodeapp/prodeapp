import { Typography, Container, Grid } from '@mui/material';
import { shortenAddress, useEthers } from '@usedapp/core';
import { BoxRow } from '../components';
import { usePlayer } from '../hooks/usePlayer';
import { formatAmount } from '../lib/helpers';


export default function Profile() {
  const { account, error: errorWallet } = useEthers();
  const { data: player, error } = usePlayer(account);
  if (typeof(account) !== 'string') return <Typography variant='h5'>Please, connect your wallet</Typography>
  if (errorWallet) return <Typography variant='h5'>Error in the wallet provider</Typography>
  if (error) {
    return <Typography variant='h5'>Error...</Typography>
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
            <div style={{ width: '60%' }}>Tournament</div>
            <div style={{ width: '20%' }}>Reward</div>
          </BoxRow>
          {player.bets && player.bets.map((bet, i) => {
            return <BoxRow key={i}>
              <div style={{ width: '20%' }}>{bet.tokenID}</div>
              <div style={{ width: '60%' }}><a href={'/tournaments/' + bet.tournament.id}>{shortenAddress(bet.tournament.id)}</a></div>
              <div style={{ width: '20%' }}>{formatAmount(bet.reward)}</div>
            </BoxRow>
          })}
        </Grid>
      </Grid>

    </Container >
  );
}
