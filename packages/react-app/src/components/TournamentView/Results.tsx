import React from "react";
import {BoxWrapper, BoxRow} from "../../components"
import {getAnswerText, getTimeLeft, isFinalized} from "../../lib/helpers";
import {useQuestions} from "../../hooks/useQuestions";
import {useMatches} from "../../hooks/useMatches";

export default function Results({tournamentId}: {tournamentId: string}) {
  const { data: matches } = useMatches(tournamentId);
  const { data: questions } = useQuestions(tournamentId);

  return <BoxWrapper>
    <BoxRow>
      <div style={{width: '60%'}}>Match</div>
      <div style={{width: '30%'}}>Result</div>
      <div style={{width: '10%'}}>Status</div>
    </BoxRow>
    {matches && matches.map((match, i) => {
      return <BoxRow style={{display: 'flex'}} key={i}>
        <div style={{width: '60%'}}>
          <a href={`https://reality.eth.link/app/index.html#!/network/100/question/0xe78996a233895be74a66f451f1019ca9734205cc-${match.questionID}`} target="_blank" rel="noreferrer">
            {questions?.[match.questionID].qTitle}
          </a>
        </div>
        <div style={{width: '30%'}}>{getTimeLeft(match.openingTs) || getAnswerText(match.answer, questions?.[match.questionID].outcomes || [])}</div>
        <div style={{width: '10%'}}>{isFinalized(match) ? 'Finalized' : 'Pending'}</div>
      </BoxRow>
    })}
  </BoxWrapper>
}
