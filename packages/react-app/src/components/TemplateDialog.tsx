import React, {useEffect, useState} from "react";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import {useFieldArray, useForm, useWatch} from "react-hook-form";
import AppDialog, {DialogProps} from "../components/Dialog";
import DialogActions from "@mui/material/DialogActions";
import {FormError} from "./index";
import TextField from '@mui/material/TextField';
import {ErrorMessage} from "@hookform/error-message";
import {PLACEHOLDER_REGEX} from "../hooks/useMarketForm";
import {marketsTemplates} from "../lib/templates";
import { Trans, t } from "@lingui/macro";

type QuestionParams = {value: string}[];

type FormValues = {
  template: number
  questionParams: QuestionParams
}

type TemplateDialogProps = DialogProps & {
  onTemplateChange: (questionPlaceholder: string, answers: string[]) => void
}

function replacePlaceholders(text: string, questionParams: string[]) {
  return text.replace(
    PLACEHOLDER_REGEX,
    (event) => {
      return questionParams[Number(event.replace('$','')) -1] || event;
    }
  )
}

function TemplateDialog({open, handleClose, onTemplateChange}: TemplateDialogProps) {
  const { control, register, handleSubmit, formState: { errors } } = useForm<FormValues>({defaultValues: {
      template: -1,
      questionParams: [],
    }});

  const {
    fields: questionParamsFields,
    append: appendQuestionParamsField,
    remove: removeQuestionParamsField
  } = useFieldArray({control, name: `questionParams`});

  const questionParams = useWatch({ control, name: `questionParams` });
  const template = useWatch({control, name: `template`});

  const [questionPlaceholder, setQuestionPlaceholder] = useState('');

  const [placeholdersCount, setPlaceholdersCount] = useState(0);

  useEffect(() => {
    if (marketsTemplates[template]) {
      setQuestionPlaceholder(marketsTemplates[template].q)
    }
  }, [template])

  useEffect(() => {
    const placeholders = questionPlaceholder.match(PLACEHOLDER_REGEX) || []

    setPlaceholdersCount(placeholders ? placeholders.length : 0);
  }, [questionPlaceholder])

  useEffect(() => {
    if (placeholdersCount > questionParams.length) {
      // add questionParams
      for(let i = questionParams.length; i < placeholdersCount; i++) {
        appendQuestionParamsField({value: ''});
      }
    } else if (placeholdersCount < questionParams.length) {
      // remove questionParams
      for(let i = placeholdersCount; i < questionParams.length; i++) {
        removeQuestionParamsField(i);
      }
    }
  }, [placeholdersCount, questionParams, appendQuestionParamsField, removeQuestionParamsField]);

  const onSubmit = (data: FormValues) => {
    if (!marketsTemplates[template]) {
      return;
    }

    onTemplateChange(
      replacePlaceholders(questionPlaceholder, data.questionParams.map(qp => qp.value)),
      marketsTemplates[template].a.map((answerPlaceholder) => {
        return replacePlaceholders(answerPlaceholder, questionParams.map(qp => qp.value));
      })
    )
  }

  const clickSubmit = () => {
    handleSubmit(onSubmit)();
  }

  const dialogActions = <DialogActions>
    <Button autoFocus onClick={clickSubmit} color="secondary">
      <Trans>Set question</Trans>
    </Button>
  </DialogActions>

  return (
    <AppDialog
      open={open}
      handleClose={handleClose}
      title={t`Choose question`}
      actions={dialogActions}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl fullWidth sx={{marginBottom: '20px'}}>
          <InputLabel id="market-template-label"><Trans>Choose template</Trans></InputLabel>
          <Select
            labelId="market-template-label"
            id="market-template-select"
            defaultValue={-1}
            {...register('template', {required: t`This field is required.`})}
          >
            <MenuItem value={-1} key={-1}><Trans>Choose question format</Trans></MenuItem>
            {marketsTemplates.map((template, i) => <MenuItem value={i} key={i}>{template.q}</MenuItem>)}
          </Select>
        </FormControl>
        <div style={{width: '100%'}}>
          <div style={{display: 'flex'}}>
            {questionParamsFields.map((questionParamField, i) => {
              return <div key={i} style={{margin: '0 5px 0 0'}}>
                <TextField {...register(`questionParams.${i}.value`, {required: t`This field is required.`})} placeholder={`$${i+1}`} />
                <FormError><ErrorMessage errors={errors} name={`questionParams.${i}.value`} /></FormError>
              </div>
            })}
          </div>
        </div>
      </form>
    </AppDialog>
  );
}

export default TemplateDialog;
