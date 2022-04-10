import React from "react";
import {useTournament} from "../hooks/useTournament";
import {DecimalBigNumber} from "../lib/DecimalBigNumber";
import {useParams} from "react-router-dom";
import {useRanking} from "../hooks/useRanking";
import {useMatches} from "../hooks/useMatches";
import {shortenAddress} from "@usedapp/core";

function TournamentsView() {
  const { id } = useParams();
  const { data: tournament } = useTournament(Number(id));
  const { data: ranking } = useRanking(Number(id));
  const { data: matches } = useMatches(Number(id));

  if (!tournament) {
    return <div>Tournament not found</div>
  }

  return (
    <>
      <div style={{display: 'flex', width: '100%'}}>
        <div style={{width: '50%'}}>{tournament.name}</div>
        <div style={{width: '50%'}}>Total Prize: {new DecimalBigNumber(tournament.totalPrize,18).toString()}</div>
      </div>

      <div style={{display: 'flex'}}>
        <div style={{width: '50%'}}>
          <div>Matches</div>

          {matches && <div>
            <div style={{display: 'flex'}}>
              <div style={{width: '80%'}}>Match</div>
              <div style={{width: '20%'}}>Result</div>
            </div>
            {matches.map((match, i) => {
              return <div style={{display: 'flex'}} key={i}>
                <div style={{width: '80%'}}>{match.question}</div>
                <div style={{width: '20%'}}>{match.result}</div>
              </div>
            })}
          </div>}
        </div>
        <div style={{width: '50%'}}>
          <div>Ranking</div>

          {ranking && <div>
            <div style={{display: 'flex'}}>
              <div style={{width: '20%'}}>#</div>
              <div style={{width: '40%'}}>Player</div>
              <div style={{width: '40%'}}>Points</div>
            </div>
            {ranking.map((rank, i) => {
              return <div style={{display: 'flex'}} key={i}>
                <div style={{width: '20%'}}>{i+1}</div>
                <div style={{width: '40%'}}>{shortenAddress(rank.player)}</div>
                <div style={{width: '40%'}}>{rank.points.toString()}</div>
              </div>
            })}
          </div>}
        </div>
      </div>

    </>
  );
}

export default TournamentsView;
