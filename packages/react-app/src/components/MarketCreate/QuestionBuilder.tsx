import {UseFormRegister, FieldErrors} from "react-hook-form";
import React from "react";
import Input from "@mui/material/Input";
import {FormError} from "../index";
import {ErrorMessage} from "@hookform/error-message";
import {MarketFormValues} from "./MarketForm";

type MatchBuilderProps = {
  matchIndex: number
  register: UseFormRegister<MarketFormValues>
  errors: FieldErrors<MarketFormValues>
}

export default function QuestionBuilder({matchIndex, register, errors}: MatchBuilderProps) {
  return <div style={{flexGrow: 1}}>
    <div style={{display: 'flex'}}>
      <Input {...register(`matches.${matchIndex}.questionPlaceholder`, {
        required: 'This field is required.'
      })} style={{flexGrow: 1}}/>
    </div>
    <FormError><ErrorMessage errors={errors} name={`matches.${matchIndex}.questionPlaceholder`} /></FormError>
  </div>
}
