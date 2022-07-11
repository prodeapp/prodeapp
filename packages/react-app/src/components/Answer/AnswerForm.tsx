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
import {INVALID_RESULT} from "../Questions/QuestionsForm";
import FormHelperText from "@mui/material/FormHelperText";
import {formatAmount, getAnswerText, getTimeLeft, isFinalized} from "../../lib/helpers";
import CircularProgress from '@mui/material/CircularProgress';
import { Trans } from "@lingui/macro";

export type AnswerFormValues = {
  outcome: number|''
}

type AnswerFormProps = {
  event: Event
  control: Control<AnswerFormValues>
  register: UseFormRegister<AnswerFormValues>
  errors: FieldErrors<AnswerFormValues>
  handleSubmit: UseFormHandleSubmit<AnswerFormValues>
}

export default function AnswerForm({event, register, errors, handleSubmit}: AnswerFormProps) {
  const { account, error: walletError } = useEthers();
  const [currentBond, setCurrentBond] = useState<BigNumber>(BigNumber.from(0));

  const { state, send } = useContractFunction(
    new Contract(process.env.REACT_APP_REALITIO as string, RealityETH_v3_0__factory.createInterface()),
    'submitAnswer'
  );

  useEffect(() => {
    const minBond = BigNumber.from(event.minBond);
    const lastBond = BigNumber.from(event.lastBond);
    setCurrentBond(lastBond.gt(0) ? lastBond.mul(2) : minBond);
  }, [event]);

  useEffect(() => {
    window.scrollTo(0, 0)
  }, []);

  if (!account || walletError) {
    return <Alert severity="error">walletError?.message || <Trans>Connect your wallet to answer</Trans></Alert>
  }

  if (state.status === 'Success') {
    return <Alert severity="success"><Trans>Answer sent</Trans>!</Alert>
  }

  const onSubmit = async (data: AnswerFormValues) => {
    await send(
      event.id,
      hexZeroPad(hexlify(data.outcome), 32),
      currentBond,
      {
        value: currentBond
      }
    )
  }

  const finalized = isFinalized(event);
  const openingTimeLeft = getTimeLeft(event.openingTs);

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
          <Trans>Result</Trans>
          </div>
          <div style={{width: '60%'}}>
            {getAnswerText(event.answer, event.outcomes || [])}
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
            <Trans>Your answer</Trans>
            </div>
            <div style={{width: '60%'}}>
              <FormControl fullWidth>
                <Select
                  defaultValue=""
                  id={`question-outcome-select`}
                  {...register(`outcome`, {required: 'This field is required.'})}
                >
                  {event.outcomes.map((outcome, i) => <MenuItem value={i} key={i}>{outcome}</MenuItem>)}
                  <MenuItem value={INVALID_RESULT}><Trans>Invalid result</Trans></MenuItem>
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
