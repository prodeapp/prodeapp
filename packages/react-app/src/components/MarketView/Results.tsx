import React, {useState} from "react";
import {BoxWrapper, BoxRow} from "../../components"
import {getAnswerText, getTimeLeft, isFinalized} from "../../lib/helpers";
import {useEvents} from "../../hooks/useEvents";
import Button from '@mui/material/Button';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AnswerDialog from "../Answer/AnswerDialog";
import {Event} from "../../graphql/subgraph";
import {queryClient} from "../../lib/react-query";
import { Trans, t } from "@lingui/macro";

function CircleItem({color}: {color: string}) {
  return <div style={{height: '14px', width: '14px', borderRadius: '50%', backgroundColor: color, marginRight: '10px'}}></div>
}

function AnswerColumn(event: Event, finalized: boolean) {
  const answerText = getAnswerText(event.answer, event.outcomes || []);

  const style = {display: 'flex', alignItems: 'center'};
  if (finalized) {
    return <div style={style}><CircleItem color="green"/> {answerText}</div>
  }

  const openingTimeLeft = getTimeLeft(event.openingTs);

  if (openingTimeLeft !== false) {
    return <div style={style}>
      <Tooltip title={t`Open to answers in ${openingTimeLeft}`}><IconButton><AccessTimeIcon/></IconButton></Tooltip>
      <CircleItem color="red"/>
      <Trans>Pending</Trans>
    </div>
  }

  if (event.isPendingArbitration) {
    return <div style={style}><CircleItem color="yellow"/><Trans>Pending arbitration</Trans></div>
  }

  const answerCountdown = getTimeLeft(event.answerFinalizedTimestamp || 0);

  if (!answerCountdown) {
    return <div style={style}><CircleItem color="yellow"/><Trans>Pending</Trans></div>;
  }

  return <div style={style}>
    <Tooltip title={t`Answer closes in ${answerCountdown}`}><IconButton><AccessTimeIcon/></IconButton></Tooltip>
    <CircleItem color="yellow"/>
    {answerText}
  </div>
}

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
      <div style={{width: '40%'}}><Trans>Event</Trans></div>
      <div style={{width: '30%'}}><Trans>Answer</Trans></div>
      <div style={{width: '30%'}}></div>
    </BoxRow>
    {events && events.map((event, i) => {
      const finalized = isFinalized(event);

      return <BoxRow key={i}>
        <div style={{width: '100%'}}>
          <div style={{display: 'flex', marginTop: 20, width: '100%', fontWeight: 'normal'}}>
            <div style={{width: '40%'}}>{event.title}</div>
            <div style={{width: '30%'}}>
              {AnswerColumn(event, finalized)}
            </div>
            <div style={{width: '30%'}}>
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
