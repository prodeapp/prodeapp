import React, {useEffect, useState} from "react";
import {FormError, BoxWrapper, BoxRow} from "../../components"
import {FormControl, MenuItem, Select} from "@mui/material";
import {Control} from "react-hook-form";
import {UseFormHandleSubmit, UseFormRegister} from "react-hook-form/dist/types/form";
import {FieldErrors} from "react-hook-form/dist/types/errors";
import {ErrorMessage} from "@hookform/error-message";
import {useContractFunction, useEthers} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {RealityETH_v3_0__factory} from "../../typechain";
import Alert from "@mui/material/Alert";
import { hexZeroPad, hexlify } from "@ethersproject/bytes";
import { BigNumber } from "@ethersproject/bignumber";
import {Event} from "../../graphql/subgraph";
import FormHelperText from "@mui/material/FormHelperText";
import {formatAmount, getAnswerText, getTimeLeft, isFinalized, showWalletError} from "../../lib/helpers";
import CircularProgress from '@mui/material/CircularProgress';
import { Trans, t } from "@lingui/macro";
import {useI18nContext} from "../../lib/I18nContext";

export const INVALID_RESULT = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
export const ANSWERED_TOO_SOON = "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe";

export type AnswerFormValues = {
  outcome: number | '' | [number] | []
}

type AnswerFormProps = {
  event: Event
  control: Control<AnswerFormValues>
  register: UseFormRegister<AnswerFormValues>
  errors: FieldErrors<AnswerFormValues>
  handleSubmit: UseFormHandleSubmit<AnswerFormValues>
  setShowActions: (showActions: boolean) => void
}

export default function AnswerForm({event, register, errors, handleSubmit, setShowActions}: AnswerFormProps) {
  const { account, error: walletError } = useEthers();
  const [currentBond, setCurrentBond] = useState<BigNumber>(BigNumber.from(0));
  const [outcomes, setOutcomes] = useState<{value: string|number, text: string}[]>([]);
  const { locale } = useI18nContext();

  const { state, send } = useContractFunction(
    new Contract(process.env.REACT_APP_REALITIO as string, RealityETH_v3_0__factory.createInterface()),
    'submitAnswer'
  );

  useEffect(() => {
    const minBond = BigNumber.from(event.minBond);
    const lastBond = BigNumber.from(event.lastBond);
    setCurrentBond(lastBond.gt(0) ? lastBond.mul(2) : minBond);

    // outcomes
    let _outcomes: {value: string|number, text: string}[] = [];

    _outcomes = event.outcomes
        // first map and then filter to keep the index of each outcome as value
        .map((outcome, i) => ({value: i, text: outcome}))
        .filter((_, i) => event.answer === null || String(i) !== BigNumber.from(event.answer).toString());

    if(event.answer !== INVALID_RESULT) {
      _outcomes.push({value: INVALID_RESULT, text: 'Invalid result'});
    }

    if (event.answer && event.answer !== ANSWERED_TOO_SOON) {
      _outcomes.push({value: ANSWERED_TOO_SOON, text: 'Answered too soon'});
    }

    setOutcomes(_outcomes);
  }, [event]);

  useEffect(() => {
    window.scrollTo(0, 0)
  }, []);

  useEffect(() => {
    if (!account || walletError) {
      setShowActions(false);
      return;
    }

    setShowActions(state.status !== 'Success');
  }, [state, account, walletError, setShowActions]);

  if (!account || walletError) {
    return <Alert severity="error">{showWalletError(walletError) || <Trans>Connect your wallet to answer</Trans>}</Alert>
  }

  if (state.status === 'Success') {
    return <Alert severity="success"><Trans>Answer sent</Trans>!</Alert>
  }

  const onSubmit = async (data: AnswerFormValues) => {
    let answer = ''
    if (typeof data.outcome === 'object') {
      const eventOutcome = Object(data.outcome)
      // TODO: Update the multiple select if there are answers with invalid or too soon.
      // this options are incompatible with multi-select
      if (eventOutcome.includes(INVALID_RESULT)) {
        answer = INVALID_RESULT
      }
      else if (eventOutcome.includes(ANSWERED_TOO_SOON)) {
        answer = ANSWERED_TOO_SOON
      }
      else {
        const answerChoice = eventOutcome.reduce((partialSum: number, value: number) => partialSum + 2 ** value, 0);
        answer = hexZeroPad(hexlify(answerChoice), 32);
      }
    } else {
      answer = hexZeroPad(hexlify(data.outcome), 32)
    }
    await send(
      event.id,
      answer,
      currentBond,
      {
        value: currentBond
      }
    )
  }

  const finalized = isFinalized(event);
  const openingTimeLeft = getTimeLeft(event.openingTs, false, locale);

  if (openingTimeLeft !== false) {
    return <div><Trans>Open to answers in {openingTimeLeft}</Trans></div>
  }

  if (event.isPendingArbitration) {
    return <div><Trans>Event result is pending arbitration.</Trans></div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="answer-form">
      {state.status === 'Mining' && <div style={{textAlign: 'center', marginBottom: 15}}><CircularProgress /></div>}
      {state.errorMessage && <Alert severity="error" sx={{mb: 2}}>{state.errorMessage}</Alert>}
      <BoxWrapper>
        <BoxRow>
          <div style={{width: '40%'}}>
          <Trans>Current result</Trans>
          </div>
          <div style={{width: '60%'}}>
            {getAnswerText(event.answer, event.outcomes || [], event.templateID)}
          </div>
        </BoxRow>
        {event.bounty !== '0' && <BoxRow>
          <div style={{width: '40%'}}>
          <Trans>Reward</Trans>
          </div>
          <div style={{width: '60%'}}>
            {formatAmount(event.bounty)}
          </div>
        </BoxRow>}
        {!finalized && <>
          <BoxRow>
            <div style={{width: '40%'}}>
            <Trans>New result</Trans>
            </div>
            <div style={{width: '60%'}}>
              <FormControl fullWidth>
                <Select
                  defaultValue={event.templateID === '3' ? [] : ""}
                  multiple={event.templateID === '3'}
                  id={`question-outcome-select`}
                  {...register(`outcome`, {required: t`This field is required.`})}
                >
                  {outcomes.map((outcome, i) => <MenuItem value={outcome.value} key={i}><Trans id={outcome.text} /></MenuItem>)}
                </Select>
                <FormError><ErrorMessage errors={errors} name={`outcome`} /></FormError>
              </FormControl>
            </div>
          </BoxRow>
          <BoxRow>
            <FormHelperText><Trans>To submit the answer you need to deposit a bond of {formatAmount(currentBond)} that will be returned if the answer is correct.</Trans></FormHelperText>
          </BoxRow>
        </>}
      </BoxWrapper>
    </form>
  );
}
