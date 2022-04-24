import { ExpandMoreOutlined } from '@mui/icons-material';
import { Typography, Container, Grid, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { Box, BoxRow } from '../components';
import { Bet } from '../graphql/subgraph';
import {formatAmount, getAnswerText} from '../lib/helpers';
import {useEthers} from "@usedapp/core";
import {usePlayerBets} from "../hooks/usePlayerBets";
import {usePlayer} from "../hooks/usePlayer";
import {useQuestions} from "../hooks/useQuestions";

function BetDetails({bet}: {bet: Bet}) {
  const { data: questions } = useQuestions(bet.tournament.id);
  return (<>
    <BoxRow>
      <div style={{ width: '40%'}}>Your Bet</div>
      <div style={{ width: '40%'}}>Match Result</div>
      <div style={{ width: '20%' }}>Points Earned</div>
    </BoxRow>
    {bet.tournament.matches.map((match, i) => {
      let betResult = getAnswerText(bet.results[i], questions?.[match.questionID].outcomes || []);
      let matchResult = getAnswerText(match.answer?.answer || null, questions?.[match.questionID].outcomes || [], "Unknown");

      return <BoxRow key={i}>
        <div style={{ width: '40%', wordBreak: 'break-word' }}>{betResult}</div>
        <div style={{ width: '40%', wordBreak: 'break-word' }}>{matchResult}</div>
        {/* TODO: If the points earned change with the tournament? */}
        <div style={{ width: '20%' }}>{betResult === matchResult ? "+1" : matchResult === "Unknown" ? "Waiting result": "0"}</div>
      </BoxRow>;
    })}
  </>);
}

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
                  <Box><BetDetails bet={bet} /></Box>
                </AccordionDetails>
              </Accordion>
            )
          })}
        </Grid>
      </Grid>

    </Container>
  )
}
