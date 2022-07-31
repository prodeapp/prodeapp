import React from "react";
import Button from '@mui/material/Button';
import {useForm} from "react-hook-form";
import AppDialog, {DialogProps} from "../../components/Dialog";
import DialogActions from "@mui/material/DialogActions";
import AnswerForm, {AnswerFormValues} from "./AnswerForm";
import {Event} from "../../graphql/subgraph";
import { Trans } from "@lingui/macro";

type AnswerDialogProps = DialogProps & {
  event: Event
}

function AnswerDialog({open, handleClose, event}: AnswerDialogProps) {
  const { register, control, formState: {errors}, handleSubmit } = useForm<AnswerFormValues>({defaultValues: {
    outcome: '',
  }});

  const dialogActions = <DialogActions>
    <Button autoFocus color="primary" type="submit" form="answer-form">
    <Trans>Submit answer</Trans>
    </Button>
  </DialogActions>

  return (
    <AppDialog
      open={open}
      handleClose={handleClose}
      title={event.title}
      actions={dialogActions}
    >
      <AnswerForm {...{event, register, control, errors, handleSubmit}} />
    </AppDialog>
  );
}

export default AnswerDialog;
