import {FieldArrayWithId, useFormContext} from "react-hook-form";
import {FormError, AnswerField} from "../index";
import TextField from '@mui/material/TextField';
import {ErrorMessage} from "@hookform/error-message";
import Button from "@mui/material/Button";
import Grid from '@mui/material/Grid';
import React from "react";
import {MarketFormStep1Values} from "../../hooks/useMarketForm";
import { Trans } from "@lingui/macro";

type AnswersBuilderProps = {
  eventIndex: number
  answersFields: FieldArrayWithId[]
  addAnswer: () => void
  deleteAnswer: (i: number) => () => void
}

export default function AnswersBuilder({eventIndex, answersFields, addAnswer, deleteAnswer}: AnswersBuilderProps) {
  const { register, formState: { errors } } = useFormContext<MarketFormStep1Values>();

  return <div style={{width: '100%'}}>

    {answersFields.length < 2 && <FormError style={{marginBottom: '5px'}}><Trans>Add at least two answers</Trans>.</FormError>}

    <Grid container spacing={2}>
      {answersFields.map((answerField, i) => {
        return <Grid item xs={6} md={4} key={answerField.id}>
          <AnswerField>
            <TextField {...register(`events.${eventIndex}.answers.${i}.value`, {required: 'This field is required.'})} style={{width: '150px'}} />
            <div style={{cursor: 'pointer', marginLeft: '10px'}} onClick={deleteAnswer(i)}>[x]</div>
          </AnswerField>
          <FormError><ErrorMessage errors={errors} name={`events.${eventIndex}.answers.${i}.value`} /></FormError>
        </Grid>
      })}
    </Grid>

    <div><Button onClick={addAnswer} size="small"><Trans>Add answer</Trans></Button></div>
  </div>
}
