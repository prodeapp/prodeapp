import React, {useEffect, useState} from "react";
import {useTournament} from "../hooks/useTournament";
import {useParams, useSearchParams} from "react-router-dom";
import {Box, BoxRow} from "../components"
import Button from '@mui/material/Button';
import QuestionsDialog from "../components/Questions/QuestionsDialog";
import {formatAmount, getTimeLeft} from "../lib/helpers";
import {useTournamentStatus} from "../hooks/useTournamentStatus";
import {DIVISOR} from "../components/TournamentCreate/TournamentForm";
import Ranking from "../components/TournamentView/Ranking";
import Results from "../components/TournamentView/Results";

function TournamentsView() {
  const { id } = useParams();
  const { isLoading, data: tournament } = useTournament(String(id));
  const { data: tournamentStatus} = useTournamentStatus(String(id));
  const [section, setSection] = useState<'ranking'|'results'>('ranking');
  const [openModal, setOpenModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | false>(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!tournament) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(tournament.closingTime, true))
    }, 1000);
    return () => clearInterval(interval);
  }, [tournament]);

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!tournament) {
    return searchParams.get('new') === '1'
            ? <div>This tournament was just created, please wait a few seconds for it to be indexed.</div>
            : <div>Tournament not found</div>
  }

  const handleClose = () => {
    setOpenModal(false);
  };

  return (
    <>
      <div style={{display: 'flex', marginBottom: '20px'}}>
        <div style={{width: '49%', textAlign: 'center'}}>
          <Box style={{height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontSize: '25px', width: '100%'}}>{tournament.name}</div>
            <div style={{fontSize: '18px', width: '100%', marginTop: 15}}>
              Status: {tournamentStatus}
            </div>
          </Box>
        </div>
        <div style={{width: '49%', marginLeft: '2%'}}>
          <Box style={{height: '100%'}}>
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
                {[4000, 3000, 2000, 1000].map((value, index) => <div key={index}>#{index+1}: {Number(value) * 100 / DIVISOR}%</div>)}
              </div>
            </BoxRow>
          </Box>
        </div>
      </div>

      {timeLeft !== false && <Box style={{padding: 20}}>
        <BoxRow>
          <div style={{textAlign: 'center', margin: '0 auto'}}>
            <div>Bet Price: {formatAmount(tournament.price)}</div>
            <Button style={{flexGrow: 0, margin: '15px 0'}} variant="outlined" size="large" onClick={() => setOpenModal(true)}>Place Bet</Button>
            <div style={{fontWeight: 'medium'}}>{timeLeft}</div>
          </div>
        </BoxRow>
      </Box>}

      <Box>
        <BoxRow style={{justifyContent: 'center'}}>
          <div><Button onClick={() => setSection('ranking')} color={section === 'ranking' ? 'secondary' : 'primary'}>Ranking</Button></div>
          <div><Button onClick={() => setSection('results')} color={section === 'results' ? 'secondary' : 'primary'}>Results</Button></div>
        </BoxRow>
      </Box>

      <QuestionsDialog
        tournamentId={String(id)}
        price={tournament.price}
        open={openModal}
        handleClose={handleClose}
      />

      {section === 'results' && id && <Results tournamentId={id} />}

      {section === 'ranking' && id && <Ranking tournamentId={id} />}
    </>
  );
}

export default TournamentsView;
