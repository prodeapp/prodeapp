import React, {useEffect, useState} from "react";
import {useTournament} from "../hooks/useTournament";
import {DecimalBigNumber} from "../lib/DecimalBigNumber";
import {useParams} from "react-router-dom";
import {useRanking} from "../hooks/useRanking";
import {useMatches} from "../hooks/useMatches";
import {shortenAddress} from "@usedapp/core";
import {Box, BoxRow} from "../components"
import Button from '@mui/material/Button';
import QuestionsDialog from "../components/Questions/QuestionsDialog";
import {getTimeLeft} from "../lib/helpers";
import fromUnixTime from "date-fns/fromUnixTime";

function TournamentsView() {
  const { id } = useParams();
  const { isLoading, data: tournament } = useTournament(String(id));
  const { data: ranking } = useRanking(String(id));
  const { data: matches } = useMatches(String(id));
  const [section, setSection] = useState<'ranking'|'results'>('ranking');
  const [openModal, setOpenModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | false>(false);

  useEffect(() => {
    if (!tournament) {
      return;
    }

    const ct = fromUnixTime(Number(tournament.closingTime));

    setTimeLeft(getTimeLeft(ct))
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
              <div>Total Prize: {new DecimalBigNumber(tournament.pool as string,18).toString()}</div>
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
          <div style={{width: '80%'}}>Match</div>
          <div style={{width: '20%'}}>Start</div>
          <div style={{width: '20%'}}>Result</div>
        </BoxRow>
        {matches && matches.map((match, i) => {
          return <BoxRow style={{display: 'flex'}} key={i}>
            <div style={{width: '60%'}}>{match.questionID}</div>
            <div style={{width: '20%'}}>{match.openingTs}</div>
            <div style={{width: '20%'}}>{match.answer!==null ? match.answer.answer : "Not answered yet"}</div>
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
