import {useFormContext} from "react-hook-form";
import React from "react";
import TextField from '@mui/material/TextField';
import {FormError} from "../index";
import {ErrorMessage} from "@hookform/error-message";
import {MarketFormStep1Values} from "../../hooks/useMarketForm";
import {t} from "@lingui/macro";

type QuestionBuilderProps = {
  eventIndex: number
}

export default function QuestionBuilder({eventIndex}: QuestionBuilderProps) {
  const { register, formState: { errors } } = useFormContext<MarketFormStep1Values>();

  return <div style={{flexGrow: 1}}>
    <div style={{display: 'flex'}}>
      <TextField {...register(`events.${eventIndex}.questionPlaceholder`, {
        required: t`This field is required.`
      })} error={!!errors.events?.[eventIndex]?.questionPlaceholder} style={{flexGrow: 1}}/>
    </div>
    <FormError><ErrorMessage errors={errors} name={`events.${eventIndex}.questionPlaceholder`} /></FormError>
  </div>
}
