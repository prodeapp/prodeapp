import {FieldArray, FieldArrayPath, UnpackNestedValue, UseFieldArrayReturn} from "react-hook-form";
import {TournamentFormats} from "../../lib/curate";
import {FieldValues} from "react-hook-form/dist/types/fields";

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