import React, {useEffect, useState} from "react";
import {useTournament} from "../hooks/useTournament";
import {useParams, useSearchParams} from "react-router-dom";
import {useRanking} from "../hooks/useRanking";
import {shortenAddress} from "@usedapp/core";
import {Box, BoxRow} from "../components"
import Button from '@mui/material/Button';
import QuestionsDialog from "../components/Questions/QuestionsDialog";
import {formatAmount, getAnswerText, getTimeLeft, isFinalized} from "../lib/helpers";
import {useQuestions} from "../hooks/useQuestions";
import {useTournamentStatus} from "../hooks/useTournamentStatus";
import {DIVISOR} from "../components/TournamentCreate/TournamentForm";

function TournamentsView() {
  const { id } = useParams();
  const { isLoading, data: tournament } = useTournament(String(id));
  const { data: ranking } = useRanking(String(id));
  const { data: questions } = useQuestions(String(id));
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

      {section === 'results' && <Box>
        <BoxRow>
          <div style={{width: '60%'}}>Match</div>
          <div style={{width: '30%'}}>Result</div>
          <div style={{width: '10%'}}>Status</div>
        </BoxRow>
        {questions && questions.map((question, i) => {
          return <BoxRow style={{display: 'flex'}} key={i}>
            <div style={{width: '60%'}}>
              <a href={`https://reality.eth.link/app/index.html#!/network/100/question/0xe78996a233895be74a66f451f1019ca9734205cc-${question.questionId}`} target="_blank" rel="noreferrer">
                {question.qTitle}
              </a>
            </div>
            <div style={{width: '30%'}}>{getTimeLeft(question.openingTimestamp) || getAnswerText(question.currentAnswer, question.outcomes)}</div>
            <div style={{width: '10%'}}>{isFinalized(question) ? 'Finalized' : 'Pending'}</div>
          </BoxRow>
        })}
      </Box>}

      {section === 'ranking' && <Box>
        <BoxRow>
          <div style={{width: '20%'}}>#</div>
          <div style={{width: '40%'}}>Player</div>
          <div style={{width: '40%'}}>Points</div>
        </BoxRow>
        {ranking && ranking.map((rank, i) => {
          return <BoxRow key={i}>
            <div style={{width: '20%'}}>{i+1}</div>
            <div style={{width: '40%'}}>{shortenAddress(rank.player.id)}</div>
            <div style={{width: '40%'}}>{rank.points.toString()}</div>
          </BoxRow>
        })}
      </Box>}
    </>
  );
}

export default TournamentsView;
