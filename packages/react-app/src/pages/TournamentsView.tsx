import React, {useEffect, useState} from "react";
import {useTournament} from "../hooks/useTournament";
import {useParams} from "react-router-dom";
import {useRanking} from "../hooks/useRanking";
import {shortenAddress} from "@usedapp/core";
import {Box, BoxRow} from "../components"
import Button from '@mui/material/Button';
import QuestionsDialog from "../components/Questions/QuestionsDialog";
import {formatAmount, getAnswerText, getTimeLeft} from "../lib/helpers";
import {useQuestions} from "../hooks/useQuestions";

function TournamentsView() {
  const { id } = useParams();
  const { isLoading, data: tournament } = useTournament(String(id));
  const { data: ranking } = useRanking(String(id));
  const { data: questions } = useQuestions(String(id));
  const [section, setSection] = useState<'ranking'|'results'>('ranking');
  const [openModal, setOpenModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | false>(false);

  useEffect(() => {
    if (!tournament) {
      return;
    }

    setTimeLeft(getTimeLeft(tournament.closingTime))
  }, [tournament]);

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!tournament) {
    return <div>Tournament not found</div>
  }

  const handleClose = () => {
    setOpenModal(false);
  };

  return (
    <>
      <div style={{display: 'flex', marginBottom: '20px'}}>
        <div style={{width: '49%'}}>
          <Box style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontSize: '25px'}}>{tournament.name}</div>
          </Box>
        </div>
        <div style={{width: '49%', marginLeft: '2%'}}>
          <Box style={{height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <BoxRow>
              <div>Total Prize: {formatAmount(tournament.pool)}</div>
            </BoxRow>
            {timeLeft !== false && <BoxRow>
              <div style={{textAlign: 'center'}}>
                <div style={{marginBottom: '15px'}}>Time left: {timeLeft}</div>
                <Button style={{flexGrow: 0, marginLeft: '10px'}} color="secondary" onClick={() => setOpenModal(true)}>Place Bet</Button>
              </div>
            </BoxRow>}
          </Box>
        </div>
      </div>

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
            <div style={{width: '60%'}}>{question.qTitle}</div>
            <div style={{width: '30%'}}>{getTimeLeft(question.openingTimestamp) || getAnswerText(question.currentAnswer, question.outcomes)}</div>
            <div style={{width: '10%'}}>{question.answerFinalizedTimestamp !== null ? 'Finalized' : 'Pending'}</div>
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
