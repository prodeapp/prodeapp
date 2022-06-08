import {Control, useFieldArray, useWatch} from "react-hook-form";
import React, {useEffect} from "react";
import Input from "@mui/material/Input";
import {FormError} from "../index";
import {ErrorMessage} from "@hookform/error-message";
import Button from "@mui/material/Button";
import {UseFormRegister} from "react-hook-form/dist/types/form";
import {FieldErrors} from "react-hook-form/dist/types/errors";
import {MarketFormValues} from "./MarketForm";

type MatchBuilderProps = {
  matchIndex: number
  removeMatch: (i: number) => void
  placeholdersCount: number
  control: Control<MarketFormValues>
  register: UseFormRegister<MarketFormValues>
  errors: FieldErrors<MarketFormValues>
}

export default function MatchBuilder({matchIndex, removeMatch, placeholdersCount, control, register, errors}: MatchBuilderProps) {
  const {
    fields: questionParamsFields,
    append: appendAnswerPlaceholderField,
    remove: removeAnswerPlaceholderField
  } = useFieldArray({control, name: `matches.${matchIndex}.questionParams`});
  const questionParams = useWatch({ control, name: `matches.${matchIndex}.questionParams` });

  useEffect(() => {
    if (placeholdersCount > questionParams.length) {
      // add questionParams
      for(let i = questionParams.length; i < placeholdersCount; i++) {
        appendAnswerPlaceholderField({value: ''});
      }
    } else if (placeholdersCount < questionParams.length) {
      // remove questionParams
      for(let i = placeholdersCount; i < questionParams.length; i++) {
        removeAnswerPlaceholderField(i);
      }
    }
  }, [placeholdersCount, questionParams, appendAnswerPlaceholderField, removeAnswerPlaceholderField]);

  return <div>
    <div style={{display: 'flex', justifyContent: 'center'}}>
      {questionParamsFields.map((questionParamField, i) => {
        return <div key={i} style={{margin: '0 5px'}}>
          <Input {...register(`matches.${matchIndex}.questionParams.${i}.value`, {required: 'This field is required.'})} placeholder={`$${i+1}`} />
          <FormError><ErrorMessage errors={errors} name={`matches.${matchIndex}.questionParams.${i}.value`} /></FormError>
        </div>
      })}
      <div><Button onClick={() => removeMatch(matchIndex)}>- Remove match</Button></div>
    </div>
  </div>
}
