import React, {useState} from "react";
import {BoxWrapper, BoxRow} from "../../components"
import {getAnswerText, getTimeLeft, isFinalized} from "../../lib/helpers";
import {useEvents} from "../../hooks/useEvents";
import Button from '@mui/material/Button';
import AnswerDialog from "../Answer/AnswerDialog";
import {Event} from "../../graphql/subgraph";
import {queryClient} from "../../lib/react-query";
import { Trans } from "@lingui/macro";

export default function Results({marketId}: {marketId: string}) {
  const { data: events } = useEvents(marketId);
  const [currentEvent, setCurrentEvent] = useState<Event|undefined>();
  const [openModal, setOpenModal] = useState(false);

  const handleClose = () => {
    setOpenModal(false);
    if (currentEvent) {
      // refetch events and question just in case the user has provided an answer
      queryClient.invalidateQueries(['useEvents', currentEvent.market.id]);
      queryClient.invalidateQueries(['useQuestion', process.env.REACT_APP_REALITIO as string, currentEvent.id]);
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
      <div style={{width: '33%'}}><Trans>Result</Trans></div>
      <div style={{width: '33%'}}><Trans>Status</Trans></div>
      <div style={{width: '33%'}}></div>
    </BoxRow>
    {events && events.map((event, i) => {
      const finalized = isFinalized(event);
      const openingTimeLeft = getTimeLeft(event.openingTs);
      const answerCountdown = getTimeLeft(event.answerFinalizedTimestamp || 0);

      return <BoxRow key={i}>
        <div style={{width: '100%'}}>
          <div>{event.title}</div>
          <div style={{display: 'flex', marginTop: 20, width: '100%', fontWeight: 'normal'}}>
            <div style={{width: '33%'}}>{openingTimeLeft !== false ? <Trans>Open to answers in {openingTimeLeft}</Trans> : getAnswerText(event.answer, event.outcomes || [])}</div>
            <div style={{width: '33%'}}>
              {finalized && <span style={{color: 'green'}}><Trans>Finalized</Trans></span>}
              {!finalized && (
                <span style={{color: 'red'}}>
                  {
                    (openingTimeLeft !== false && <Trans>Pending</Trans>) ||
                    (event.isPendingArbitration
                      ? <Trans>Pending arbitration</Trans>
                      : !answerCountdown
                        ? <Trans>Pending</Trans>
                        : <Trans>Answer closes in {answerCountdown}</Trans>
                    )
                  }
                </span>
              )}
            </div>
            <div style={{width: '33%'}}>
              {!finalized && <Button
                color="primary" size="small"
                onClick={() => {setCurrentEvent(event);setOpenModal(true);}}>
                <Trans>Answer result</Trans>
              </Button>}
            </div>
          </div>
        </div>
      </BoxRow>
    })}
  </BoxWrapper>
  </>
}
