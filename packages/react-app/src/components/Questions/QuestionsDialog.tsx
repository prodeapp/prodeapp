import React from "react";
import Button from '@mui/material/Button';
import {useForm} from "react-hook-form";
import AppDialog, {DialogProps} from "../../components/Dialog";
import DialogActions from "@mui/material/DialogActions";
import QuestionsForm, {QuestionsFormValues} from "./QuestionsForm";
import type {BigNumber} from "ethers";

type QuestionsDialogProps = DialogProps & {
  tournamentId: string
  price: BigNumber
}

function QuestionsDialog({open, handleClose, tournamentId, price}: QuestionsDialogProps) {
  const { register, control, formState: {errors}, handleSubmit } = useForm<QuestionsFormValues>({defaultValues: {
    outcomes: [],
  }});

  const dialogActions = <DialogActions>
    <Button autoFocus color="secondary" type="submit" form="questions-form">
      Place bets
    </Button>
  </DialogActions>

  return (
    <AppDialog
      open={open}
      handleClose={handleClose}
      title="Place your bets"
      actions={dialogActions}
    >
      <QuestionsForm {...{tournamentId, price, register, control, errors, handleSubmit}} />
    </AppDialog>
  );
}

export default QuestionsDialog;
