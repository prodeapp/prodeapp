import React, {useState} from "react";
import {useTournament} from "../hooks/useTournament";
import {DecimalBigNumber} from "../lib/DecimalBigNumber";
import {useParams} from "react-router-dom";
import {useRanking} from "../hooks/useRanking";
import {useMatches} from "../hooks/useMatches";
import {shortenAddress} from "@usedapp/core";
import {Button, Box, BoxRow} from "../components"

function TournamentsView() {
  const { id } = useParams();
  const { data: tournament } = useTournament(Number(id));
  const { data: ranking } = useRanking(Number(id));
  const { data: matches } = useMatches(Number(id));

  const [section, setSection] = useState<'ranking'|'results'>('ranking');

  if (!tournament) {
    return <div>Tournament not found</div>
  }

  return (
    <>
      <div style={{display: 'flex', marginBottom: '20px'}}>
        <div style={{width: '49%'}}>
          <Box style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontSize: '25px'}}>{tournament.name}</div>
          </Box>
        </div>
        <div style={{width: '49%', marginLeft: '2%'}}>
          <Box style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <BoxRow>
              <div>Total Prize: {new DecimalBigNumber(tournament.totalPrize,18).toString()}</div>
            </BoxRow>
          </Box>
        </div>
      </div>

      <Box>
        <BoxRow style={{justifyContent: 'center'}}>
          <div><Button onClick={() => setSection('ranking')} className={section === 'ranking' ? 'active' : ''}>Ranking</Button></div>
          <div><Button onClick={() => setSection('results')} className={section === 'results' ? 'active' : ''}>Results</Button></div>
        </BoxRow>
      </Box>

      {section === 'results' && <Box>
        <BoxRow>
          <div style={{width: '80%'}}>Match</div>
          <div style={{width: '20%'}}>Result</div>
        </BoxRow>
        {matches && matches.map((match, i) => {
          return <BoxRow style={{display: 'flex'}} key={i}>
            <div style={{width: '80%'}}>{match.question}</div>
            <div style={{width: '20%'}}>{match.result}</div>
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
            <div style={{width: '40%'}}>{shortenAddress(rank.player)}</div>
            <div style={{width: '40%'}}>{rank.points.toString()}</div>
          </BoxRow>
        })}
      </Box>}
    </>
  );
}

export default TournamentsView;
