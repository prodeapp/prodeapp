import React from "react";
import {BoxWrapper, BoxRow} from "../../components"
import {getAnswerText, getTimeLeft, isFinalized} from "../../lib/helpers";
import {useQuestions} from "../../hooks/useQuestions";
import {useMatches} from "../../hooks/useMatches";
import Button from '@mui/material/Button';

export default function Results({tournamentId}: {tournamentId: string}) {
  const { data: matches } = useMatches(tournamentId);
  const { data: questions } = useQuestions(tournamentId);

  return <BoxWrapper>
    <BoxRow>
      <div style={{width: '33%'}}>Result</div>
      <div style={{width: '33%'}}>Status</div>
      <div style={{width: '33%'}}></div>
    </BoxRow>
    {matches && questions && matches.map((match, i) => {
      const finalized = isFinalized(match);
      const openingTimeLeft = getTimeLeft(match.openingTs);

      return <BoxRow key={i}>
        <div style={{width: '100%'}}>
          <div>{questions?.[match.questionID].qTitle}</div>
          <div style={{display: 'flex', marginTop: 20, width: '100%', fontWeight: 'normal'}}>
            <div style={{width: '33%'}}>{openingTimeLeft !== false ? `Open to answers in ${openingTimeLeft}` : getAnswerText(match.answer, questions?.[match.questionID].outcomes || [])}</div>
            <div style={{width: '33%'}}>
              {finalized && <span style={{color: 'green'}}>Finalized</span>}
              {!finalized && (
                <span style={{color: 'red'}}>
                  {
                    (openingTimeLeft !== false && 'Pending') ||
                    (match.isPendingArbitration ? 'Pending arbitration' : `Answer closes in ${getTimeLeft(match.answerFinalizedTimestamp || 0)}`)
                  }
                </span>
              )}
            </div>
            <div style={{width: '33%'}}>
              <Button
                component="a" color="primary" size="small"
                href={`https://reality.eth.link/app/index.html#!/network/100/question/0xe78996a233895be74a66f451f1019ca9734205cc-${match.questionID}`}
                target="_blank" rel="noreferrer">
                Go to reality.eth
              </Button>
            </div>
          </div>
        </div>
      </BoxRow>
    })}
  </BoxWrapper>
}
