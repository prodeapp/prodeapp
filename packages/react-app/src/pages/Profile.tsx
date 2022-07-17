import { Typography, Container, Grid, Button, Skeleton } from '@mui/material';
import { BoxRow, BoxWrapper } from '../components';
import { formatAmount } from '../lib/helpers';
import { useEthers } from "@usedapp/core";
import { usePlayer } from "../hooks/usePlayer";
import Alert from "@mui/material/Alert";
import * as React from "react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Trans } from '@lingui/macro';
import { Bets } from '../components/ProfileView/Bets';
import Referrals from '../components/ProfileView/Referrals';

export default function Profile() {
  const { id } = useParams();
  const { account, error: walletError } = useEthers();
  const [playerId, setPlayerId] = useState('');
  const [section, setSection] = useState<'bets' | 'referrals'>('bets');
  const { data: player } = usePlayer(String(playerId));


  useEffect(() => {
    setPlayerId(id || account || '')
  }, [id, account]);

  if (!id) {
    if (!account || walletError) {
      return <Alert severity="error">{walletError?.message || <Trans>Connect your wallet to view your profile.</Trans>}</Alert>
    }
  }

  return (
    <Container>
      <Grid container columnSpacing={2} rowSpacing={1} sx={{ marginTop: '30px', justifyContent: 'space-between' }}>

        <Grid item sm={12} md={4} sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <BoxWrapper sx={{ padding: 2 }}>  
            <Typography variant='h5'><Trans>Total Bet: {player? formatAmount(player?.amountBet) : <Skeleton />}</Trans></Typography>
          </BoxWrapper>
        </Grid>
        <Grid item sm={12} md={4} sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <BoxWrapper sx={{ padding: 2 }}>
            <Typography variant='h5'><Trans>Total Rewards: {player? formatAmount(player?.pricesReceived): <Skeleton />}</Trans></Typography>
          </BoxWrapper>
        </Grid>
        <Grid item sm={12} md={4} sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <BoxWrapper sx={{ padding: 2 }}>
            <Typography variant='h5'><Trans>Referrals Earnings: {player? formatAmount(player?.totalAttributions): <Skeleton />}</Trans></Typography>
          </BoxWrapper>
        </Grid>
      </Grid>
      <BoxWrapper>
        <BoxRow style={{ justifyContent: 'center' }}>
          <div><Button onClick={() => setSection('bets')} color={section === 'bets' ? 'secondary' : 'primary'}><Trans>Bets</Trans></Button></div>
          <div><Button onClick={() => setSection('referrals')} color={section === 'referrals' ? 'secondary' : 'primary'}><Trans>Referrals</Trans></Button></div>
        </BoxRow>
      </BoxWrapper>

      {section === 'bets' && <Bets playerId={playerId} />}

      {section === 'referrals' && <Referrals provider={playerId} />}

    </Container>
  )
}
