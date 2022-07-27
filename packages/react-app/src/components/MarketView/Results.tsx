import React, {useEffect, useState} from "react";
import {BoxWrapper, BoxRow} from "../../components"
import {getAnswerText, getTimeLeft, isFinalized} from "../../lib/helpers";
import {useEvents} from "../../hooks/useEvents";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import AnswerDialog from "../Answer/AnswerDialog";
import {Event} from "../../graphql/subgraph";
import {queryClient} from "../../lib/react-query";
import { Trans, t } from "@lingui/macro";
import {useI18nContext} from "../../lib/I18nContext";
import {FormatLeague} from "../FormatTeams";
import {ANSWERED_TOO_SOON} from "../Answer/AnswerForm";
import {useContractFunction} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {RealityETH_v3_0__factory} from "../../typechain";
import {encodeQuestionText, REALITY_TEMPLATE_ID} from "../../lib/reality";
import {usePhone} from "../../hooks/useResponsive";

const bigColumnSx = {
  width: {xs: '100%', md: '40%'},
  fontSize: {xs: '14px', md: '16px'},
  marginBottom: {xs: '10px', md: '0'},
  wordBreak: 'break-word',
}

const smallColumnsSx = {
  width: {xs: '50%', md: '30%'},
  fontSize: {xs: '13px', md: '16px'},
  display: 'inline-block',
  verticalAlign: 'top',
  wordBreak: 'break-word',
  textAlign: {xs: 'center', md: 'left'}
}

function CircleItem({color}: {color: string}) {
  return <div style={{height: '14px', width: '14px', borderRadius: '50%', backgroundColor: color, marginRight: '10px'}}></div>
}

function AnswerColumn(event: Event, finalized: boolean) {
  const { locale } = useI18nContext();

  const answerText = getAnswerText(event.answer, event.outcomes || []);

  const style = {display: 'flex', alignItems: 'center'};

  if (finalized) {
    if (event.answer === ANSWERED_TOO_SOON) {
      return <div style={style}><CircleItem color="yellow"/> {answerText}</div>
    }

    return <div style={style}><CircleItem color="green"/> {answerText}</div>
  }

  const openingTimeLeft = getTimeLeft(event.openingTs, false, locale);

  if (openingTimeLeft !== false) {
    return <div>
      <div style={style}><CircleItem color="red"/> <Trans>Pending</Trans></div>
      <div style={{fontSize: '13px', marginTop: '5px'}}>{t`Open to answers in ${openingTimeLeft}`}</div>
    </div>
  }

  if (event.isPendingArbitration) {
    return <div style={style}><CircleItem color="yellow"/><Trans>Pending arbitration</Trans></div>
  }

  const answerCountdown = getTimeLeft(event.answerFinalizedTimestamp || 0, false, locale);

  if (!answerCountdown) {
    return <div style={style}><CircleItem color="yellow"/><Trans>Pending</Trans></div>;
  }

  return <div>
    <div style={style}><CircleItem color="yellow"/> {answerText}</div>
    <div style={{fontSize: '13px', marginTop: '5px'}}>{t`Answer closes in ${answerCountdown}`}</div>
  </div>
}

function ActionColumn(event: Event, finalized: boolean, clickHandler: () => void) {
  const { locale } = useI18nContext();

  const { state, send } = useContractFunction(
    new Contract(process.env.REACT_APP_REALITIO as string, RealityETH_v3_0__factory.createInterface()),
    'reopenQuestion'
  );

  useEffect(() => {
    if (state.errorMessage) {
      alert(state.errorMessage);
    }
  }, [state]);

  if (finalized) {
    if (event.answer === ANSWERED_TOO_SOON) {
      const reopenQuestion = async () => {
        await send(
          REALITY_TEMPLATE_ID,
          encodeQuestionText('single-select', event.title, event.outcomes, event.category, 'en_US'),
          event.arbitrator,
          event.timeout,
          event.openingTs,
          event.nonce,
          event.minBond,
          event.id
        );
      }

      if (state.status === 'Success') {
        // TODO: update event in cache to allow to answer instantly
        return <div><Trans>Question reopened!</Trans></div>
      }

      return <Button
        color="primary" size="small"
        onClick={reopenQuestion}>
        <Trans>Reopen question</Trans>
      </Button>
    }

    return null;
  }

  const openingTimeLeft = getTimeLeft(event.openingTs, false, locale);

  if (openingTimeLeft !== false) {
    return null;
  }

  return <Button
    color="primary" size="small"
    onClick={clickHandler}>
    {event.answer === null ? <Trans>Answer result</Trans> : <Trans>Change result</Trans>}
  </Button>
}

export default function Results({marketId}: {marketId: string}) {
  const { data: events } = useEvents(marketId);
  const [currentEvent, setCurrentEvent] = useState<Event|undefined>();
  const [openModal, setOpenModal] = useState(false);
  const isPhone = usePhone();

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
    {!isPhone && <BoxRow>
      <div style={{width: '40%'}}><Trans>Event</Trans></div>
      <div style={{width: '30%'}}><Trans>Result</Trans></div>
      <div style={{width: '30%'}}></div>
    </BoxRow>}
    {events && events.map((event, i) => {
      const finalized = isFinalized(event);

      return <BoxRow key={i}>
        <div style={{width: '100%'}}>
          <Box sx={{display: {md: 'flex'}, alignItems: 'center', width: '100%', fontWeight: 'normal'}}>
            <Box sx={bigColumnSx}><FormatLeague title={event.title} /></Box>
            <Box sx={smallColumnsSx}>
              {AnswerColumn(event, finalized)}
            </Box>
            <Box sx={smallColumnsSx}>
              {ActionColumn(event, finalized, () => {setCurrentEvent(event);setOpenModal(true);})}
            </Box>
          </Box>
        </div>
      </BoxRow>
    })}
  </BoxWrapper>
  </>
}
