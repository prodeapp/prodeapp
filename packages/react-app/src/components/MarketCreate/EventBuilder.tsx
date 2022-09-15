import {Controller, useFieldArray, useFormContext} from "react-hook-form";
import React, {useState} from "react";
import {FormError, FormLabel, FormRow} from "../index";
import Button from "@mui/material/Button";
import QuestionBuilder from "./QuestionBuilder";
import AnswersBuilder from "./AnswersBuilder";
import {DATE_FORMAT, formatAnswers} from "../../pages/MarketsCreate";
import TemplateDialog from "../TemplateDialog";
import {MarketFormStep1Values} from "../../hooks/useMarketForm";
import {t, Trans} from "@lingui/macro";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {DateTimePicker} from "@mui/x-date-pickers/DateTimePicker";
import TextField from "@mui/material/TextField";
import FormHelperText from "@mui/material/FormHelperText";
import {ErrorMessage} from "@hookform/error-message";

type EventBuilderProps = {
  eventIndex: number
  removeEvent: (i: number) => void
}

const today = new Date();

export default function EventBuilder({eventIndex, removeEvent}: EventBuilderProps) {

  const { control, setValue, formState: { errors } } = useFormContext<MarketFormStep1Values>();

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

  return <div style={{borderBottom: '1px solid black', marginBottom: '30px'}}>
    <TemplateDialog
      open={openModal}
      handleClose={handleClose}
      onTemplateChange={onTemplateChange}
    />
    <FormRow>
      <FormLabel><Trans>Question</Trans> #{eventIndex+1}</FormLabel>
      <div>
        <QuestionBuilder {...{eventIndex}} />
        <Button onClick={() => setOpenModal(true)} variant="outlined"><Trans>Choose Question</Trans></Button>
      </div>
    </FormRow>
    <FormRow>
      <FormLabel><Trans>Opening Time (UTC)</Trans></FormLabel>
      <div>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Controller
            control={control}
            name={`events.${eventIndex}.openingTs`}
            rules={{required: t`This field is required`}}
            render={({ field }) => (
              <DateTimePicker
                minDate={today}
                onChange={field.onChange}
                value={field.value}
                inputFormat={DATE_FORMAT}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            )}
          />
        </LocalizationProvider>
        <FormHelperText><Trans>The results of this event will be available to be answered at this time.</Trans></FormHelperText>
        <FormError><ErrorMessage errors={errors} name={`events.${eventIndex}.openingTs`} /></FormError>
      </div>
    </FormRow>
    <FormRow>
      <FormLabel><Trans>Answers</Trans></FormLabel>
      <AnswersBuilder {...{eventIndex, answersFields, addAnswer, deleteAnswer}} />
    </FormRow>

    <FormRow>
      <Button onClick={addAnswer} variant="outlined"><Trans>Add answer</Trans> +</Button>
      <Button onClick={() => removeEvent(eventIndex)} color="error" sx={{ml: 2}}><Trans>Remove event</Trans> -</Button>
    </FormRow>
  </div>
}
