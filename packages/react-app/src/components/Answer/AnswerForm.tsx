import React, {useEffect} from "react";
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
import { BigNumber } from "@ethersproject/bignumber";
import {Event} from "../../graphql/subgraph";
import FormHelperText from "@mui/material/FormHelperText";
import {formatAmount, getAnswerText, getTimeLeft, isFinalized, showWalletError} from "../../lib/helpers";
import CircularProgress from '@mui/material/CircularProgress';
import { Trans, t } from "@lingui/macro";
import {useI18nContext} from "../../lib/I18nContext";
import {
  formatOutcome,
  REALITY_TEMPLATE_MULTIPLE_SELECT,
  INVALID_RESULT,
  ANSWERED_TOO_SOON,
  REALITY_TEMPLATE_SINGLE_SELECT
} from "../../lib/reality";

export type FormEventOutcomeValue = number | typeof INVALID_RESULT | typeof ANSWERED_TOO_SOON;

export type AnswerFormValues = {
  outcome: FormEventOutcomeValue | [FormEventOutcomeValue] | ''
}

type AnswerFormProps = {
  event: Event
  control: Control<AnswerFormValues>
  register: UseFormRegister<AnswerFormValues>
  errors: FieldErrors<AnswerFormValues>
  handleSubmit: UseFormHandleSubmit<AnswerFormValues>
  setShowActions: (showActions: boolean) => void
}

function getOutcomes(event: Event) {
  // outcomes
  let outcomes: {value: FormEventOutcomeValue, text: string}[] = [];

  outcomes = event.outcomes
    // first map and then filter to keep the index of each outcome as value
    .map((outcome, i) => ({value: i, text: outcome}))

  if (event.templateID === REALITY_TEMPLATE_SINGLE_SELECT) {
    outcomes = outcomes.filter((_, i) => event.answer === null || String(i) !== BigNumber.from(event.answer).toString());
  }

  if(event.answer !== INVALID_RESULT) {
    outcomes.push({value: INVALID_RESULT, text: 'Invalid result'});
  }

  if (event.answer && event.answer !== ANSWERED_TOO_SOON) {
    outcomes.push({value: ANSWERED_TOO_SOON, text: 'Answered too soon'});
  }

  return outcomes;
}

export default function AnswerForm({event, register, errors, handleSubmit, setShowActions}: AnswerFormProps) {
  const { account, error: walletError } = useEthers();
  const { locale } = useI18nContext();

  const { state, send } = useContractFunction(
    new Contract(process.env.REACT_APP_REALITIO as string, RealityETH_v3_0__factory.createInterface()),
    'submitAnswer'
  );

  const lastBond = BigNumber.from(event.lastBond);
  const currentBond = lastBond.gt(0) ? lastBond.mul(2) : BigNumber.from(event.minBond);

  const outcomes = getOutcomes(event);

  useEffect(() => {
    if (!account || showWalletError(walletError)) {
      setShowActions(false);
      return;
    }

    setShowActions(state.status !== 'Success');
  }, [state, account, walletError, setShowActions]);

  const showError = showWalletError(walletError)
  if (!account || showError) {
    return <Alert severity="error">{showError || <Trans>Connect your wallet to answer</Trans>}</Alert>
  }

  if (state.status === 'Success') {
    return <Alert severity="success"><Trans>Answer sent</Trans>!</Alert>
  }

  const onSubmit = async (data: AnswerFormValues) => {
    await send(
      event.id,
      formatOutcome(data.outcome),
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
                  defaultValue={event.templateID === REALITY_TEMPLATE_MULTIPLE_SELECT ? [] : ""}
                  multiple={event.templateID === REALITY_TEMPLATE_MULTIPLE_SELECT}
                  id={`question-outcome-select`}
                  {...register(`outcome`, {required: t`This field is required.`})}
                  error={!!errors.outcome}
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
