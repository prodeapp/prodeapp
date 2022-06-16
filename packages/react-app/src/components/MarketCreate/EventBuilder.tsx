import {
  Control,
  UseFormRegister,
  FieldErrors,
  UseFormSetValue, useFieldArray
} from "react-hook-form";
import React from "react";
import {BoxLabelCell, BoxRow} from "../index";
import Button from "@mui/material/Button";
import {MarketFormValues} from "./MarketForm";
import QuestionBuilder from "./QuestionBuilder";
import AnswersBuilder from "./AnswersBuilder";
import {formatAnswers} from "../../pages/MarketsCreate";

type EventBuilderProps = {
  eventIndex: number
  removeEvent: (i: number) => void
  control: Control<MarketFormValues>
  setValue: UseFormSetValue<MarketFormValues>
  register: UseFormRegister<MarketFormValues>
  errors: FieldErrors<MarketFormValues>
}

export default function EventBuilder({eventIndex, removeEvent, control, setValue, register, errors}: EventBuilderProps) {

  const {
    fields: answersFields,
    append: appendAnswerField,
    remove: removeAnswerField,
    replace: replaceAnswerField
  } = useFieldArray({control, name: `events.${eventIndex}.answers`});

  const deleteAnswer = (i: number) => {
    return () => removeAnswerField(i);
  }

  const addAnswer = () => appendAnswerField({value: ''});

  const onTemplateChange = (questionPlaceholder: string, answers: string[]) => {
    setValue(`events.${eventIndex}.questionPlaceholder`, questionPlaceholder)

    if (answers.length > 0) {
      replaceAnswerField(formatAnswers(answers))
    }
  }

  return <div>
    <BoxRow>
      <BoxLabelCell>Question</BoxLabelCell>
      <div style={{width: '100%', display: 'flex'}}>
        <QuestionBuilder {...{eventIndex, onTemplateChange, control, register, errors}} />
      </div>
    </BoxRow>
    <BoxRow>
      <BoxLabelCell>Answers</BoxLabelCell>
      <AnswersBuilder {...{eventIndex, answersFields, register, errors, addAnswer, deleteAnswer}} />
    </BoxRow>

    <div style={{textAlign: 'center', marginTop: '20px'}}><Button onClick={() => removeEvent(eventIndex)}>- Remove event</Button></div>
  </div>
}
