import React, {useState} from "react";
import {BoxWrapper, BoxRow} from "../../components"
import {getAnswerText, getTimeLeft, isFinalized} from "../../lib/helpers";
import {useQuestions} from "../../hooks/useQuestions";
import {useEvents} from "../../hooks/useEvents";
import Button from '@mui/material/Button';
import AnswerDialog from "../Answer/AnswerDialog";
import {Event} from "../../graphql/subgraph";
import {queryClient} from "../../lib/react-query";

export default function Results({marketId}: {marketId: string}) {
  const { data: events } = useEvents(marketId);
  const { data: questions } = useQuestions(marketId);
  const [currentEvent, setCurrentEvent] = useState<Event|undefined>();
  const [openModal, setOpenModal] = useState(false);

  const handleClose = () => {
    setOpenModal(false);
    if (currentEvent) {
      // refetch events and question just in case the user has provided an answer
      queryClient.invalidateQueries(['useEvents', currentEvent.market.id]);
      queryClient.invalidateQueries(['useQuestion', process.env.REACT_APP_REALITIO as string, currentEvent.questionID]);
    }
  }

  return <>
    {currentEvent && <AnswerDialog
      open={openModal}
      handleClose={handleClose}
      event={currentEvent}
    />}
  <BoxWrapper>
    <BoxRow>
      <div style={{width: '33%'}}>Result</div>
      <div style={{width: '33%'}}>Status</div>
      <div style={{width: '33%'}}></div>
    </BoxRow>
    {events && questions && events.map((event, i) => {
      const finalized = isFinalized(event);
      const openingTimeLeft = getTimeLeft(event.openingTs);
      const answerCountdown = getTimeLeft(event.answerFinalizedTimestamp || 0);

      return <BoxRow key={i}>
        <div style={{width: '100%'}}>
          <div>{questions?.[event.questionID].qTitle}</div>
          <div style={{display: 'flex', marginTop: 20, width: '100%', fontWeight: 'normal'}}>
            <div style={{width: '33%'}}>{openingTimeLeft !== false ? `Open to answers in ${openingTimeLeft}` : getAnswerText(event.answer, questions?.[event.questionID].outcomes || [])}</div>
            <div style={{width: '33%'}}>
              {finalized && <span style={{color: 'green'}}>Finalized</span>}
              {!finalized && (
                <span style={{color: 'red'}}>
                  {
                    (openingTimeLeft !== false && 'Pending') ||
                    (event.isPendingArbitration ? 'Pending arbitration' : !answerCountdown ? 'Pending' : `Answer closes in ${answerCountdown}`)
                  }
                </span>
              )}
            </div>
            <div style={{width: '33%'}}>
              {!finalized && <Button
                color="primary" size="small"
                onClick={() => {setCurrentEvent(event);setOpenModal(true);}}>
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
