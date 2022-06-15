import {
  Control,
  UseFormRegister,
  FieldErrors,
  UseFormSetValue, useFieldArray
} from "react-hook-form";
import React, {useState} from "react";
import {BoxLabelCell, BoxRow} from "../index";
import Button from "@mui/material/Button";
import {MarketFormValues} from "./MarketForm";
import QuestionBuilder from "./QuestionBuilder";
import AnswersBuilder from "./AnswersBuilder";
import {formatAnswers} from "../../pages/MarketsCreate";
import TemplateDialog from "../TemplateDialog";

type EventBuilderProps = {
  eventIndex: number
  removeEvent: (i: number) => void
  control: Control<MarketFormValues>
  setValue: UseFormSetValue<MarketFormValues>
  register: UseFormRegister<MarketFormValues>
  errors: FieldErrors<MarketFormValues>
}

export default function EventBuilder({eventIndex, removeEvent, control, setValue, register, errors}: EventBuilderProps) {

  const [openModal, setOpenModal] = useState(false);

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

  const handleClose = () => {
    setOpenModal(false);
  };

  const onTemplateChange = (questionPlaceholder: string, answers: string[]) => {
    setValue(`events.${eventIndex}.questionPlaceholder`, questionPlaceholder)
    replaceAnswerField(formatAnswers(answers))

    setOpenModal(false);
  }

  return <div>
    <TemplateDialog
      open={openModal}
      handleClose={handleClose}
      onTemplateChange={onTemplateChange}
    />
    <BoxRow>
      <BoxLabelCell>Question</BoxLabelCell>
      <div style={{width: '100%', display: 'flex'}}>
        <QuestionBuilder {...{eventIndex, control, register, errors}} />
        <Button style={{flexGrow: 0, marginLeft: '10px'}} onClick={() => setOpenModal(true)}>Choose Question</Button>
      </div>
    </BoxRow>
    <BoxRow>
      <BoxLabelCell>Answers</BoxLabelCell>
      <AnswersBuilder {...{eventIndex, answersFields, register, errors, addAnswer, deleteAnswer}} />
    </BoxRow>

    <div style={{textAlign: 'center', marginTop: '20px'}}><Button onClick={() => removeEvent(eventIndex)}>- Remove event</Button></div>
  </div>
}
