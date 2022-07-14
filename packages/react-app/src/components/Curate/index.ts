import {FieldArray, FieldArrayPath, UnpackNestedValue, UseFieldArrayReturn} from "react-hook-form";
import {TournamentFormats} from "../../lib/curate";

export type CurateSubmitFormExtraDataGroups = {
  groups: {
    size: number
    name: string
  }[]
  rounds: number
}

export type CurateSubmitFormValues = {
  name: string
  description: string
  format: '' | TournamentFormats
  startingTimestamp: string
  questions: {value: string}[]
  extraDataGroups: CurateSubmitFormExtraDataGroups
}

export function modifyArrayField<TFieldValues, TFieldArrayName extends FieldArrayPath<TFieldValues>>(
  useFieldArrayReturn: UseFieldArrayReturn<TFieldValues, TFieldArrayName>,
  expectedLength: number,
  value: Partial<UnpackNestedValue<FieldArray<TFieldValues, TFieldArrayName>>> | Partial<UnpackNestedValue<FieldArray<TFieldValues, TFieldArrayName>>>[]
) {
  const {fields, remove, append} = useFieldArrayReturn;

  if (fields.length > expectedLength) {
    const to = fields.length
    for(let i = expectedLength; i < to; i++) {
      remove(i);
    }
  } else if (fields.length < expectedLength) {
    const from = fields.length
    for(let i = from; i < expectedLength; i++) {
      append(value);
    }
  }
}