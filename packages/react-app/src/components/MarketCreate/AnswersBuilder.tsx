import {Control, useFieldArray} from "react-hook-form";
import {FormError, AnswerField, AnswerFieldWrapper} from "../index";
import Input from "@mui/material/Input";
import {ErrorMessage} from "@hookform/error-message";
import Button from "@mui/material/Button";
import React from "react";
import {UseFormRegister} from "react-hook-form/dist/types/form";
import {FieldErrors} from "react-hook-form/dist/types/errors";
import {MarketFormValues} from "./MarketForm";

type AnswersBuilderProps = {
  control: Control<MarketFormValues>
  register: UseFormRegister<MarketFormValues>
  errors: FieldErrors<MarketFormValues>
}

export default function AnswersBuilder({control, register, errors}: AnswersBuilderProps) {
  const {
    fields: answersPlaceholderFields,
    append: appendAnswerPlaceholderField,
    remove: removeAnswerPlaceholderField
  } = useFieldArray({control, name: 'answersPlaceholder'});

  const deleteAnswer = (i: number) => {
    return () => removeAnswerPlaceholderField(i);
  }

  const addAnswer = () => appendAnswerPlaceholderField({value: ''});

  return <div>
    {answersPlaceholderFields.length < 2 && <FormError style={{marginBottom: '5px'}}>Add at least two answers.</FormError>}
    {answersPlaceholderFields.map((answerField, i) => {
      return <AnswerFieldWrapper key={answerField.id}>
        <AnswerField>
          <Input {...register(`answersPlaceholder.${i}.value`, {required: 'This field is required.'})} style={{width: '150px'}} />
          <div style={{cursor: 'pointer', marginLeft: '10px'}} onClick={deleteAnswer(i)}>[x]</div>
        </AnswerField>
        <FormError><ErrorMessage errors={errors} name={`answersPlaceholder.${i}.value`} /></FormError>
      </AnswerFieldWrapper>
    })}
    <Button onClick={addAnswer} size="small">Add answer</Button>
  </div>
}
