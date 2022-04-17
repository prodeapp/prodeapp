import {Control, useFieldArray, useWatch} from "react-hook-form";
import React, {useEffect} from "react";
import {AlertError, AnswerField, AnswerFieldWrapper} from "../index";
import Input from "@mui/material/Input";
import {ErrorMessage} from "@hookform/error-message";
import Button from "@mui/material/Button";
import {UseFormRegister, UseFormSetValue} from "react-hook-form/dist/types/form";
import {FieldErrors} from "react-hook-form/dist/types/errors";
import {TournamentFormValues} from "./TournamentForm";

type PrizeWeightsBuilderProps = {
  control: Control<TournamentFormValues>
  register: UseFormRegister<TournamentFormValues>
  errors: FieldErrors<TournamentFormValues>
  setValue: UseFormSetValue<TournamentFormValues>
}

export default function PrizeWeightsBuilder({control, register, errors, setValue}: PrizeWeightsBuilderProps) {
  const { fields: prizesFields, append: appendPrizesField, remove: removePrizesField } = useFieldArray({control, name: 'prizeWeights'});

  const prizeWeights = useWatch({control, name: 'prizeWeights'});

  useEffect(() => {
    setValue('prizeDivisor', prizeWeights.map((pw) => Number(pw.value)).reduce((partialSum, a) => partialSum + a, 0));
  }, [setValue, prizeWeights]);

  const deletePrizeWeight = (i: number) => {
    return () => removePrizesField(i);
  }

  const addPrizeWeight = () => appendPrizesField({value: 0});

  return <div>
    {prizesFields.length === 0 && <AlertError style={{marginBottom: '5px'}}>Add at least one prize weight.</AlertError>}
    {prizesFields.map((answerField, i) => {
      return <AnswerFieldWrapper key={answerField.id}>
        <AnswerField>
          <div style={{marginRight: '10px'}}>#{i+1}</div>
          <Input {...register(`prizeWeights.${i}.value`, {required: 'This field is required.'})} style={{width: '100px'}} type="number" />
          <div style={{cursor: 'pointer', marginLeft: '10px'}} onClick={deletePrizeWeight(i)}>[x]</div>
        </AnswerField>
        <AlertError><ErrorMessage errors={errors} name={`prizeWeights.${i}.value`} /></AlertError>
      </AnswerFieldWrapper>
    })}
    <AlertError><ErrorMessage errors={errors} name={`prizeDivisor`} /></AlertError>
    <Button onClick={addPrizeWeight} size="small">Add prize weight</Button>
  </div>
}