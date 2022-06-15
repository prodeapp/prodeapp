import {FieldArrayWithId} from "react-hook-form";
import {FormError, AnswerField} from "../index";
import Input from "@mui/material/Input";
import {ErrorMessage} from "@hookform/error-message";
import Button from "@mui/material/Button";
import Grid from '@mui/material/Grid';
import React from "react";
import {UseFormRegister} from "react-hook-form/dist/types/form";
import {FieldErrors} from "react-hook-form/dist/types/errors";
import {MarketFormValues} from "./MarketForm";

type AnswersBuilderProps = {
  eventIndex: number
  answersFields: FieldArrayWithId[]
  register: UseFormRegister<MarketFormValues>
  errors: FieldErrors<MarketFormValues>
  addAnswer: () => void
  deleteAnswer: (i: number) => () => void
}

export default function AnswersBuilder({eventIndex, answersFields, register, errors, addAnswer, deleteAnswer}: AnswersBuilderProps) {
  return <div style={{width: '100%'}}>

    {answersFields.length < 2 && <FormError style={{marginBottom: '5px'}}>Add at least two answers.</FormError>}

    <Grid container spacing={2}>
      {answersFields.map((answerField, i) => {
        return <Grid item xs={6} md={4} key={answerField.id}>
          <AnswerField>
            <Input {...register(`events.${eventIndex}.answers.${i}.value`, {required: 'This field is required.'})} style={{width: '150px'}} />
            <div style={{cursor: 'pointer', marginLeft: '10px'}} onClick={deleteAnswer(i)}>[x]</div>
          </AnswerField>
          <FormError><ErrorMessage errors={errors} name={`events.${eventIndex}.answers.${i}.value`} /></FormError>
        </Grid>
      })}
    </Grid>

    <div><Button onClick={addAnswer} size="small">Add answer</Button></div>
  </div>
}
