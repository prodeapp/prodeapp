import React, {useState} from "react";
import {BoxWrapper, BoxRow} from "../../components"
import {getAnswerText, getTimeLeft, isFinalized} from "../../lib/helpers";
import {useQuestions} from "../../hooks/useQuestions";
import {useMatches} from "../../hooks/useMatches";
import Button from '@mui/material/Button';
import AnswerDialog from "../Answer/AnswerDialog";
import {Match} from "../../graphql/subgraph";
import {queryClient} from "../../lib/react-query";

export default function Results({marketId}: {marketId: string}) {
  const { data: matches } = useMatches(marketId);
  const { data: questions } = useQuestions(marketId);
  const [currentMatch, setCurrentMatch] = useState<Match|undefined>();
  const [openModal, setOpenModal] = useState(false);

  const handleClose = () => {
    setOpenModal(false);
    if (currentMatch) {
      // refetch matches and question just in case the user has provided an answer
      queryClient.invalidateQueries(['useMatches', currentMatch.market.id]);
      queryClient.invalidateQueries(['useQuestion', process.env.REACT_APP_REALITIO as string, currentMatch.questionID]);
    }
  }

  return <>
    {currentMatch && <AnswerDialog
      open={openModal}
      handleClose={handleClose}
      match={currentMatch}
    />}
  <BoxWrapper>
    <BoxRow>
      <div style={{width: '33%'}}>Result</div>
      <div style={{width: '33%'}}>Status</div>
      <div style={{width: '33%'}}></div>
    </BoxRow>
    {matches && questions && matches.map((match, i) => {
      const finalized = isFinalized(match);
      const openingTimeLeft = getTimeLeft(match.openingTs);
      const answerCountdown = getTimeLeft(match.answerFinalizedTimestamp || 0);

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
                    (match.isPendingArbitration ? 'Pending arbitration' : !answerCountdown ? 'Pending' : `Answer closes in ${answerCountdown}`)
                  }
                </span>
              )}
            </div>
            <div style={{width: '33%'}}>
              {!finalized && <Button
                color="primary" size="small"
                onClick={() => {setCurrentMatch(match);setOpenModal(true);}}>
                Answer result
              </Button>}
            </div>
          </div>
        </div>
      </BoxRow>
    })}
  </BoxWrapper>
  </>
}