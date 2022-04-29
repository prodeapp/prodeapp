import React, {useState} from "react";
import {useTournament} from "../hooks/useTournament";
import {useParams, useSearchParams} from "react-router-dom";
import {BoxWrapper, BoxRow} from "../components"
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import {formatAmount} from "../lib/helpers";
import {DIVISOR} from "../components/TournamentCreate/TournamentForm";
import Ranking from "../components/TournamentView/Ranking";
import Results from "../components/TournamentView/Results";
import PlaceBet from "../components/TournamentView/PlaceBet";
import {useEthers} from "@usedapp/core";
import Alert from "@mui/material/Alert";
import TournamentStatus from "../components/TournamentView/TournamentStatus";

function TournamentsView() {
  const { id } = useParams();
  const { isLoading, data: tournament } = useTournament(String(id));
  const { account } = useEthers();
  const [section, setSection] = useState<'ranking'|'results'|'my-bets'>('ranking');
  const [searchParams] = useSearchParams();

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!tournament) {
    return searchParams.get('new') === '1'
            ? <div>This tournament was just created, please wait a few seconds for it to be indexed.</div>
            : <div>Tournament not found</div>
  }

  return (
    <>
      <Box sx={{display: {md: 'flex'}, marginBottom: '20px'}}>
        <Box sx={{width: {md: '49%'}, textAlign: 'center'}}>
          <BoxWrapper sx={{height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: {xs: 2, md: 0}}}>
            <div style={{fontSize: '25px', width: '100%'}}>{tournament.name}</div>
            <div style={{fontSize: '18px', width: '100%', marginTop: 15}}>
              Status: <TournamentStatus tournamentId={tournament.id} />
            </div>
          </BoxWrapper>
        </Box>
        <Box sx={{width: {md: '49%'}, marginLeft: {md: '2%'}}}>
          <BoxWrapper sx={{height: '100%'}}>
            <BoxRow style={{display: 'flex'}}>
              <div style={{width: '50%'}}>Pool</div>
              <div style={{width: '50%'}}>{formatAmount(tournament.pool)}</div>
            </BoxRow>
            <BoxRow style={{display: 'flex'}}>
              <div style={{width: '50%'}}>Management Fee</div>
              <div style={{width: '50%'}}>{Number(tournament.managementFee) * 100 / DIVISOR}%</div>
            </BoxRow>
            <BoxRow style={{display: 'flex'}}>
              <div style={{width: '50%'}}>Prize Distribution</div>
              <div style={{width: '50%'}}>
                {tournament.prizes.map((value, index) => <div key={index}>#{index+1}: {Number(value) * 100 / DIVISOR}%</div>)}
              </div>
            </BoxRow>
          </BoxWrapper>
        </Box>
      </Box>

      <PlaceBet tournament={tournament} />

      <BoxWrapper>
        <BoxRow style={{justifyContent: 'center'}}>
          <div><Button onClick={() => setSection('ranking')} color={section === 'ranking' ? 'secondary' : 'primary'}>Ranking</Button></div>
          <div><Button onClick={() => setSection('results')} color={section === 'results' ? 'secondary' : 'primary'}>Results</Button></div>
          <div><Button onClick={() => setSection('my-bets')} color={section === 'my-bets' ? 'secondary' : 'primary'}>My Bets</Button></div>
        </BoxRow>
      </BoxWrapper>

      {section === 'results' && <Results tournamentId={tournament.id} />}

      {section === 'ranking' && <Ranking tournamentId={tournament.id} />}

      {section === 'my-bets' && <>
        {account && <Ranking tournamentId={tournament.id} playerId={account} />}
        {!account && <Alert severity="error">Connect your wallet to see your bets.</Alert>}
      </>}
    </>
  );
}

export default TournamentsView;
