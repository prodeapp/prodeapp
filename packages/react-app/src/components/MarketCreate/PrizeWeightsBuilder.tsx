import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import React, { useEffect } from "react";
import { FormError, AnswerField, AnswerFieldWrapper } from "../index";
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import { ErrorMessage } from "@hookform/error-message";
import Button from "@mui/material/Button";
import { MarketFormStep2Values } from "../../hooks/useMarketForm";
import { Trans, t } from "@lingui/macro";

export default function PrizeWeightsBuilder() {
  const { control, setValue, register, formState: { errors } } = useFormContext<MarketFormStep2Values>();

  const { fields: prizesFields, append: appendPrizesField, remove: removePrizesField } = useFieldArray({ control, name: 'prizeWeights' });

  const prizeWeights = useWatch({ control, name: 'prizeWeights' });

  useEffect(() => {
    setValue('prizeDivisor', prizeWeights.map((pw) => Number(pw.value)).reduce((partialSum, a) => partialSum + a, 0));
  }, [setValue, prizeWeights]);

  const deletePrizeWeight = (i: number) => {
    return () => removePrizesField(i);
  }

  const addPrizeWeight = () => appendPrizesField({ value: 0 });

  return <div>
    {prizesFields.length === 0 && <FormError style={{ marginBottom: '5px' }}><Trans>Add at least one prize weight.</Trans></FormError>}
    {prizesFields.map((answerField, i) => {
      const prizeMedal =
        i === 0 ? `🥇` :
          i === 1 ? `🥈` :
            i === 2 ? `🥉` : `#${i + 1}`;
      return <AnswerFieldWrapper key={answerField.id}>
        <AnswerField>
          <div style={{ marginRight: '10px' }}>{prizeMedal}</div>
          <TextField {...register(`prizeWeights.${i}.value`, { required: t`This field is required.` })} style={{ width: '100px' }} type="number" />
          <div style={{ cursor: 'pointer', marginLeft: '10px' }} onClick={deletePrizeWeight(i)}>[x]</div>
        </AnswerField>
        <FormError><ErrorMessage errors={errors} name={`prizeWeights.${i}.value`} /></FormError>
      </AnswerFieldWrapper>
    })}
    <FormHelperText><Trans>What % of the pool will win the player ranked at position #X.</Trans></FormHelperText>
    <FormError><ErrorMessage errors={errors} name={`prizeDivisor`} /></FormError>
    <Button onClick={addPrizeWeight} size="small"><Trans>Add prize weight</Trans></Button>
  </div>
}