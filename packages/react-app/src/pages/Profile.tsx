import { Typography, Container, Grid, Button, Skeleton } from '@mui/material';
import { BoxRow, BoxWrapper } from '../components';
import {formatAmount} from '../lib/helpers';
import { usePlayer } from "../hooks/usePlayer";
import Alert from "@mui/material/Alert";
import * as React from "react";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { Trans } from '@lingui/react';
import { Bets } from '../components/ProfileView/Bets';
import { Referrals } from '../components/ProfileView/Referrals';
import { Markets } from '../components/ProfileView/Markets';
import ProfileForm from "../components/ProfileView/ProfileForm";
import {getAccount} from "@wagmi/core";
import {useNetwork} from "wagmi";

export default function Profile() {
  const { id } = useParams();
  const {address} = getAccount();
  const { chain } = useNetwork()
  const [section, setSection] = useState<'bets' | 'referrals' | 'markets'>('bets');
  const playerId = id || address || '';
  const { data: player } = usePlayer(String(playerId));

  if (!id) {
    if (!address) {
      return <Alert severity="error"><Trans id="Connect your wallet to view your profile." /></Alert>
    }
    if (!chain || chain.unsupported) {
      return <Alert severity="error"><Trans id="UNSUPPORTED_CHAIN" /></Alert>
    }
  }

  return (
    <Container>
      <Grid container columnSpacing={2} rowSpacing={1} sx={{ marginTop: '30px', justifyContent: 'space-between' }}>
        <Grid item sm={12} md={4} sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <BoxWrapper sx={{ padding: 2 }}>  
            <Typography variant='h5'><Trans id="Total Bet: {0}" values={{0: player? formatAmount(player?.amountBet) : <Skeleton />}}/></Typography>
          </BoxWrapper>
        </Grid>
        <Grid item sm={12} md={4} sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <BoxWrapper sx={{ padding: 2 }}>
            <Typography variant='h5'><Trans id="Total Rewards: {0}" values={{0: player? formatAmount(player?.pricesReceived): <Skeleton />}}/></Typography>
          </BoxWrapper>
        </Grid>
        <Grid item sm={12} md={4} sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <BoxWrapper sx={{ padding: 2 }}>
            <Typography variant='h5'><Trans id="Referrals Earnings: {0}" values={{0: player? formatAmount(player?.totalAttributions): <Skeleton />}}/></Typography>
          </BoxWrapper>
        </Grid>
      </Grid>

      {player && address && player.id.toLowerCase() === address.toLowerCase() && <ProfileForm defaultName={player.name} />}

      <BoxWrapper>
        <BoxRow style={{ justifyContent: 'center' }}>
          <div><Button onClick={() => setSection('bets')} color={section === 'bets' ? 'secondary' : 'primary'}><Trans id="Bets" /></Button></div>
          <div><Button onClick={() => setSection('referrals')} color={section === 'referrals' ? 'secondary' : 'primary'}><Trans id="Referrals" /></Button></div>
          <div><Button onClick={() => setSection('markets')} color={section === 'markets' ? 'secondary' : 'primary'}><Trans id="Markets" /></Button></div>
        </BoxRow>
      </BoxWrapper>

      {section === 'bets' && <Bets playerId={playerId} />}

      {section === 'referrals' && <Referrals provider={playerId} />}

      {section === 'markets' && <Markets creatorId={playerId} />}

    </Container>
  )
}
