import {FieldArrayWithId, useFormContext} from "react-hook-form";
import {FormError} from "../index";
import TextField from '@mui/material/TextField';
import {ErrorMessage} from "@hookform/error-message";
import Grid from '@mui/material/Grid';
import React from "react";
import {MarketFormStep1Values} from "../../hooks/useMarketForm";
import { Trans, t } from "@lingui/macro";
import {ReactComponent as CrossIcon} from "../../assets/icons/cross.svg";

type AnswersBuilderProps = {
  eventIndex: number
  answersFields: FieldArrayWithId[]
  deleteAnswer: (i: number) => () => void
}

export default function AnswersBuilder({eventIndex, answersFields, deleteAnswer}: AnswersBuilderProps) {
  const { register, formState: { errors } } = useFormContext<MarketFormStep1Values>();

  return <div style={{width: '100%'}}>

    {answersFields.length < 2 && <FormError style={{marginBottom: '5px'}}><Trans>Add at least two answers</Trans>.</FormError>}

    <Grid container spacing={2}>
      {answersFields.map((answerField, i) => {
        return <Grid item xs={6} md={4} key={answerField.id}>
          <div>
            <TextField
              {...register(`events.${eventIndex}.answers.${i}.value`, {required: t`This field is required.`})}
              error={!!errors.events?.[eventIndex]?.answers?.[i]?.value}
              fullWidth
              InputProps={{
                endAdornment: <div style={{cursor: 'pointer', marginLeft: '10px'}} onClick={deleteAnswer(i)}><CrossIcon width={15} height={15} /></div>
              }}
            />
          </div>
          <FormError><ErrorMessage errors={errors} name={`events.${eventIndex}.answers.${i}.value`} /></FormError>
        </Grid>
      })}
    </Grid>
  </div>
}
