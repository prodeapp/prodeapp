import React, {useEffect, useState} from "react";
import {TableHeader, TableBody} from "../../components"
import {getAnswerText, getTimeLeft, isFinalized} from "../../lib/helpers";
import {useEvents} from "../../hooks/useEvents";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import AnswerDialog from "../Answer/AnswerDialog";
import {Event} from "../../graphql/subgraph";
import {queryClient} from "../../lib/react-query";
import { Trans } from '@lingui/react'
import {useI18nContext} from "../../lib/I18nContext";
import {FormatEvent, FormatOutcome} from "../FormatEvent";
import {encodeQuestionText, REALITY_TEMPLATE_MULTIPLE_SELECT, ANSWERED_TOO_SOON} from "../../lib/reality";
import {usePhone} from "../../hooks/useResponsive";
import {ReactComponent as ArrowRightIcon} from "../../assets/icons/arrow-right.svg";
import {useContractWrite} from "wagmi";
import {RealityAbi} from "../../abi/RealityETH_v3_0";
import {Address} from "@wagmi/core"
import {BigNumber} from "@ethersproject/bignumber";

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

function StatusBadge({color, children}: {color: 'red'|'green'|'yellow', children: React.ReactNode}) {
  const colors = {
    'red': ['#C42E2F', '#FFCCCC'],
    'green': ['#0A7846','#6AE8AF'],
    'yellow': ['#FAD202', '#FAEA99'],
  };

  return <div style={{fontSize:'14px', padding: '4px 12px', display: 'inline-flex', alignItems: 'center', fontWeight:600, background: colors[color][1]}}>
    <div style={{height: '6.5px', width: '6.5px', borderRadius: '50%', backgroundColor: colors[color][0], marginRight: '10px'}}></div>
    {children}
  </div>
}

function AnswerColumn(event: Event, finalized: boolean) {
  const { locale } = useI18nContext();

  const answerText = getAnswerText(event.answer, event.outcomes || [], event.templateID);

  if (finalized) {
    if (event.answer === ANSWERED_TOO_SOON) {
      return <StatusBadge color="yellow">{answerText}</StatusBadge>
    }

    return <div>
      <StatusBadge color="green"><FormatOutcome name={answerText} title={event.title}/></StatusBadge>
      <div style={{fontSize: '11.11px', marginTop: '5px'}}>
        <Trans id="Answer accepted" />
      </div>
    </div>
  }

  const openingTimeLeft = getTimeLeft(event.openingTs, false, locale);

  if (openingTimeLeft !== false) {
    return <div>
      <StatusBadge color="red"><Trans id="Pending" /></StatusBadge>
      <div style={{fontSize: '11.11px', marginTop: '5px'}}>
        <Trans id="Open to answers in {openingTimeLeft}" values={{openingTimeLeft}} />
      </div>
    </div>
  }

  if (event.isPendingArbitration) {
    return <StatusBadge color="yellow"><Trans id="Pending arbitration" /></StatusBadge>
  }

  const answerCountdown = getTimeLeft(event.answerFinalizedTimestamp || 0, false, locale);

  if (!answerCountdown) {
    return <StatusBadge color="yellow"><Trans id="Pending" /></StatusBadge>;
  }

  return <div>
    <StatusBadge color="yellow">{answerText}</StatusBadge>
    <div style={{fontSize: '11.11px', marginTop: '5px'}}>
      <Trans id="Answer closes in {answerCountdown}" values={{answerCountdown}}/>
    </div>
  </div>
}

function ActionColumn(event: Event, finalized: boolean, clickHandler: () => void) {
  const { locale } = useI18nContext();

  const { isSuccess, write, error } = useContractWrite({
    mode: 'recklesslyUnprepared',
    address: import.meta.env.VITE_REALITIO as Address,
    abi: RealityAbi,
    functionName: 'reopenQuestion',
  })

  useEffect(() => {
    if (error) {
      alert(error.message);
    }
  }, [error]);

  if (finalized) {
    if (event.answer === ANSWERED_TOO_SOON) {
      const reopenQuestion = async () => {
        await write!({
          recklesslySetUnpreparedArgs: [
            BigNumber.from(event.templateID),
            encodeQuestionText(event.templateID === REALITY_TEMPLATE_MULTIPLE_SELECT ? 'multiple-select' : 'single-select', event.title, event.outcomes, event.category, 'en_US'),
            event.arbitrator,
            Number(event.timeout),
            Number(event.openingTs),
            BigNumber.from(0),
            BigNumber.from(event.minBond),
            event.id
          ]
        });
      }

      if (isSuccess) {
        // TODO: update event in cache to allow to answer instantly
        return <div><Trans id="Question reopened!" /></div>
      }

      return <Button
        color="primary" size="small"
        onClick={reopenQuestion}>
        <Trans id="Reopen question" />
      </Button>
    }

    return null;
  }

  const openingTimeLeft = getTimeLeft(event.openingTs, false, locale);

  if (openingTimeLeft !== false) {
    return null;
  }

  return <span
    className="js-link"
    onClick={clickHandler}>
    {event.answer === null ? <Trans id="Answer result" /> : <Trans id="Change result" />}
    <ArrowRightIcon style={{marginLeft: '10px'}} />
  </span>
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
      queryClient.invalidateQueries(['useEvents', currentEvent.markets[0].id]);
      queryClient.invalidateQueries(['useQuestion', import.meta.env.VITE_REALITIO as Address, currentEvent.id]);
    }
  }

  return <>
    {currentEvent && <AnswerDialog
      open={openModal}
      handleClose={handleClose}
      event={currentEvent}
    />}
  <div>
    {!isPhone && <TableHeader>
      <div style={{width: '40%'}}><Trans id="Event" /></div>
      <div style={{width: '30%'}}><Trans id="Result" /></div>
      <div style={{width: '30%'}}></div>
    </TableHeader>}
    {events && events.map((event, i) => {
      const finalized = isFinalized(event);

      return <TableBody key={i} className="padding-lg">
        <div style={{width: '100%'}}>
          <Box sx={{display: {md: 'flex'}, alignItems: 'center', width: '100%', fontWeight: 'normal'}}>
            <Box sx={bigColumnSx}><FormatEvent title={event.title} /></Box>
            <Box sx={smallColumnsSx}>
              {AnswerColumn(event, finalized)}
            </Box>
            <Box sx={smallColumnsSx}>
              {ActionColumn(event, finalized, () => {setCurrentEvent(event);setOpenModal(true);})}
            </Box>
          </Box>
        </div>
      </TableBody>
    })}
  </div>
  </>
}
