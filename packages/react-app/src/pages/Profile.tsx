import { Typography, Container, Grid, Button, Skeleton } from '@mui/material';
import { BoxRow, BoxWrapper } from '../components';
import {formatAmount, showWalletError} from '../lib/helpers';
import { useEthers } from "@usedapp/core";
import { usePlayer } from "../hooks/usePlayer";
import Alert from "@mui/material/Alert";
import * as React from "react";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { Trans } from '@lingui/macro';
import { Bets } from '../components/ProfileView/Bets';
import { Referrals } from '../components/ProfileView/Referrals';
import { Markets } from '../components/ProfileView/Markets';
import ProfileForm from "../components/ProfileView/ProfileForm";

export default function Profile() {
  const { id } = useParams();
  const { account, error: walletError } = useEthers();
  const [section, setSection] = useState<'bets' | 'referrals' | 'markets'>('bets');
  const playerId = id || account || '';
  const { data: player } = usePlayer(String(playerId));

  if (!id) {
    if (!account || walletError) {
      return <Alert severity="error">{showWalletError(walletError) || <Trans>Connect your wallet to view your profile.</Trans>}</Alert>
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

      {player && account && player.id.toLowerCase() === account.toLowerCase() && <ProfileForm defaultName={player.name} />}

      <BoxWrapper>
        <BoxRow style={{ justifyContent: 'center' }}>
          <div><Button onClick={() => setSection('bets')} color={section === 'bets' ? 'secondary' : 'primary'}><Trans>Bets</Trans></Button></div>
          <div><Button onClick={() => setSection('referrals')} color={section === 'referrals' ? 'secondary' : 'primary'}><Trans>Referrals</Trans></Button></div>
          <div><Button onClick={() => setSection('markets')} color={section === 'markets' ? 'secondary' : 'primary'}><Trans>Markets</Trans></Button></div>
        </BoxRow>
      </BoxWrapper>

      {section === 'bets' && <Bets playerId={playerId} />}

      {section === 'referrals' && <Referrals provider={playerId} />}

      {section === 'markets' && <Markets creatorId={playerId} />}

    </Container>
  )
}
