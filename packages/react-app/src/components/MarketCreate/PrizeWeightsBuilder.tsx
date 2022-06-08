import {Control, useFieldArray, useWatch} from "react-hook-form";
import React, {useEffect} from "react";
import {FormError, AnswerField, AnswerFieldWrapper} from "../index";
import Input from "@mui/material/Input";
import FormHelperText from '@mui/material/FormHelperText';
import {ErrorMessage} from "@hookform/error-message";
import Button from "@mui/material/Button";
import {UseFormRegister, UseFormSetValue} from "react-hook-form/dist/types/form";
import {FieldErrors} from "react-hook-form/dist/types/errors";
import {MarketFormValues} from "./MarketForm";

type PrizeWeightsBuilderProps = {
  control: Control<MarketFormValues>
  register: UseFormRegister<MarketFormValues>
  errors: FieldErrors<MarketFormValues>
  setValue: UseFormSetValue<MarketFormValues>
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
    {prizesFields.length === 0 && <FormError style={{marginBottom: '5px'}}>Add at least one prize weight.</FormError>}
    {prizesFields.map((answerField, i) => {
      const prizeMedal = 
        i === 0 ? `🥇` :
        i === 1 ? `🥈` :
        i === 2 ? `🥉` : `#${i+1}`;
      return <AnswerFieldWrapper key={answerField.id}>
        <AnswerField>
          <div style={{marginRight: '10px'}}>{prizeMedal}</div>
          <Input {...register(`prizeWeights.${i}.value`, {required: 'This field is required.'})} style={{width: '100px'}} type="number" />
          <div style={{cursor: 'pointer', marginLeft: '10px'}} onClick={deletePrizeWeight(i)}>[x]</div>
        </AnswerField>
        <FormError><ErrorMessage errors={errors} name={`prizeWeights.${i}.value`} /></FormError>
      </AnswerFieldWrapper>
    })}
    <FormHelperText>What % of the pool will win the player ranked at position #X.</FormHelperText>
    <FormError><ErrorMessage errors={errors} name={`prizeDivisor`} /></FormError>
    <Button onClick={addPrizeWeight} size="small">Add prize weight</Button>
  </div>
}