import React from "react";
import Button from '@mui/material/Button';
import {useForm} from "react-hook-form";
import AppDialog, {DialogProps} from "../../components/Dialog";
import DialogActions from "@mui/material/DialogActions";
import AnswerForm, {AnswerFormValues} from "./AnswerForm";
import {Match} from "../../graphql/subgraph";
import {useQuestion} from "../../hooks/useQuestions";
import Alert from "@mui/material/Alert";

type AnswerDialogProps = DialogProps & {
  match: Match
}

function AnswerDialog({open, handleClose, match}: AnswerDialogProps) {
  const { data: question, error, isLoading } = useQuestion(process.env.REACT_APP_REALITIO as string, match.questionID);

  const { register, control, formState: {errors}, handleSubmit } = useForm<AnswerFormValues>({defaultValues: {
    outcome: '',
  }});

  const dialogActions = <DialogActions>
    <Button autoFocus color="secondary" type="submit" form="answer-form">
      Submit answer
    </Button>
  </DialogActions>

  return (
    <AppDialog
      open={open}
      handleClose={handleClose}
      title={question?.qTitle || (isLoading && 'Loading...') || ''}
      actions={dialogActions}
    >
      {error && <Alert severity="error">{error.message}</Alert>}
      {question && <AnswerForm {...{match, question, register, control, errors, handleSubmit}} />}
    </AppDialog>
  );
}

export default AnswerDialog;