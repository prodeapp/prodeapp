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
import {Match, Question} from "../../graphql/subgraph";
import {INVALID_RESULT} from "../Questions/QuestionsForm";
import FormHelperText from "@mui/material/FormHelperText";
import {formatAmount, getAnswerText, getTimeLeft, isFinalized} from "../../lib/helpers";
import CircularProgress from '@mui/material/CircularProgress';

export type AnswerFormValues = {
  outcome: number|''
}

type AnswerFormProps = {
  match: Match
  question: Question
  control: Control<AnswerFormValues>
  register: UseFormRegister<AnswerFormValues>
  errors: FieldErrors<AnswerFormValues>
  handleSubmit: UseFormHandleSubmit<AnswerFormValues>
}

export default function AnswerForm({match, question, control, register, errors, handleSubmit}: AnswerFormProps) {
  const { account, error: walletError } = useEthers();
  const [currentBond, setCurrentBond] = useState<BigNumber>(BigNumber.from(0));

  const { state, send } = useContractFunction(
    new Contract(process.env.REACT_APP_REALITIO as string, RealityETH_v3_0__factory.createInterface()),
    'submitAnswer'
  );

  useEffect(() => {
    const minBond = BigNumber.from(question.minBond);
    const lastBond = BigNumber.from(question.lastBond);
    setCurrentBond(lastBond.gt(0) ? lastBond.mul(2) : minBond);
  }, [question]);

  useEffect(() => {
    window.scrollTo(0, 0)
  }, []);

  if (!account || walletError) {
    return <Alert severity="error">{walletError?.message || 'Connect your wallet to answer.'}</Alert>
  }

  if (state.status === 'Success') {
    return <Alert severity="success">Answer sent!</Alert>
  }

  const onSubmit = async (data: AnswerFormValues) => {
    await send(
      question.questionId,
      hexZeroPad(hexlify(data.outcome), 32),
      currentBond,
      {
        value: currentBond
      }
    )
  }

  const finalized = isFinalized(match);
  const openingTimeLeft = getTimeLeft(match.openingTs);

  if (openingTimeLeft !== false) {
    return <div>{`Open to answers in ${openingTimeLeft}`}</div>
  }

  if (match.isPendingArbitration) {
    return <div>Match result is pending arbitration.</div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="answer-form">
      {state.status === 'Mining' && <div style={{textAlign: 'center', marginBottom: 15}}><CircularProgress /></div>}
      {state.errorMessage && <Alert severity="error" sx={{mb: 2}}>{state.errorMessage}</Alert>}
      <BoxWrapper>
        <BoxRow>
          <div style={{width: '40%'}}>
            Result
          </div>
          <div style={{width: '60%'}}>
            {getAnswerText(match.answer, question.outcomes || [])}
          </div>
        </BoxRow>
        {question.bounty !== '0' && <BoxRow>
          <div style={{width: '40%'}}>
            Reward
          </div>
          <div style={{width: '60%'}}>
            {formatAmount(question.bounty)}
          </div>
        </BoxRow>}
        {!finalized && <>
          <BoxRow>
            <div style={{width: '40%'}}>
              Your answer
            </div>
            <div style={{width: '60%'}}>
              <FormControl fullWidth>
                <Select
                  defaultValue=""
                  id={`question-outcome-select`}
                  {...register(`outcome`, {required: 'This field is required.'})}
                >
                  {question.outcomes.map((outcome, i) => <MenuItem value={i} key={i}>{outcome.answer}</MenuItem>)}
                  <MenuItem value={INVALID_RESULT}>Invalid result</MenuItem>
                </Select>
                <FormError><ErrorMessage errors={errors} name={`outcome`} /></FormError>
              </FormControl>
            </div>
          </BoxRow>
          <BoxRow>
            <FormHelperText>To submit the answer you need to deposit a bond of {formatAmount(currentBond)} that will be returned if the answer is correct.</FormHelperText>
          </BoxRow>
        </>}
      </BoxWrapper>
    </form>
  );
}
