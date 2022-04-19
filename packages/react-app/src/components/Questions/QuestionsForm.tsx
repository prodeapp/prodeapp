import React, {useEffect} from "react";
import {AlertError, Box, BoxRow} from "../../components"
import {useQuestions} from "../../hooks/useQuestions";
import {FormControl, MenuItem, Select} from "@mui/material";
import {Control, useFieldArray} from "react-hook-form";
import {UseFormHandleSubmit, UseFormRegister} from "react-hook-form/dist/types/form";
import {FieldErrors} from "react-hook-form/dist/types/errors";
import {ErrorMessage} from "@hookform/error-message";
import {useContractFunction} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {Tournament, Tournament__factory} from "../../typechain";
import Alert from "@mui/material/Alert";
import { hexZeroPad, hexlify } from "@ethersproject/bytes";
import type {BigNumber} from "ethers";

export type QuestionsFormValues = {
  outcomes: {value: number|''}[]
}

type QuestionsFormProps = {
  tournamentId: string
  price: BigNumber
  control: Control<QuestionsFormValues>
  register: UseFormRegister<QuestionsFormValues>
  errors: FieldErrors<QuestionsFormValues>
  handleSubmit: UseFormHandleSubmit<QuestionsFormValues>
}

export default function QuestionsForm({tournamentId, price, control, register, errors, handleSubmit}: QuestionsFormProps) {
  const { isLoading, error, data: questions } = useQuestions(tournamentId);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "outcomes",
  });

  useEffect(()=> {
    remove();
    questions && questions.forEach(() => append({value: ''}))
  }, [questions, append, remove]);

  const { state, send } = useContractFunction(
    new Contract(tournamentId, Tournament__factory.createInterface()) as Tournament,
    'placeBet'
  );

  useEffect(() => {
    if (state.status === 'Success') {
      alert('Bet placed!');
    }
  }, [state]);

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error loading questions.</div>
  }

  const onSubmit = async (data: QuestionsFormValues) => {
    await send(
      data.outcomes.map(outcome => {
        if (outcome.value === '') {
          throw Error('Invalid outcome')
        }

        return hexZeroPad(hexlify(outcome.value), 32)
      },
      {
        value: price
      })
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="questions-form">
      {state.errorMessage && <Alert severity="error" sx={{mb: 2}}>{state.errorMessage}</Alert>}
      <Box>
        <BoxRow>
          <div style={{width: '80%'}}>Question</div>
          <div style={{width: '20%'}}>Outcome</div>
        </BoxRow>
        {fields.map((field, i) => {
          if (!questions || !questions[i]) {
            return null;
          }
          return <BoxRow style={{display: 'flex'}} key={field.id}>
            <div style={{width: '60%'}}>{questions[i].qTitle}</div>
            <div style={{width: '20%'}}>
              <FormControl fullWidth>
                <Select
                  defaultValue=""
                  id={`question-${i}-outcome-select`}
                  {...register(`outcomes.${i}.value`, {required: 'This field is required.'})}
                >
                  {questions?.[i]?.outcomes.map((outcome, i) => <MenuItem value={i} key={i}>{outcome.answer}</MenuItem>)}
                </Select>
                <AlertError><ErrorMessage errors={errors} name={`outcomes.${i}.value`} /></AlertError>
              </FormControl>
            </div>
          </BoxRow>
        })}
      </Box>
    </form>
  );
}
