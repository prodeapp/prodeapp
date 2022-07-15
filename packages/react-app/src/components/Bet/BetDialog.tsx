import React from "react";
import Button from '@mui/material/Button';
import {useForm} from "react-hook-form";
import AppDialog, {DialogProps} from "../../components/Dialog";
import DialogActions from "@mui/material/DialogActions";
import BetForm, {BetFormValues} from "./BetForm";
import type {BigNumberish} from "ethers";
import { Trans, t } from "@lingui/macro";

type BetDialogProps = DialogProps & {
  marketId: string
  price: BigNumberish
}

function BetDialog({open, handleClose, marketId, price}: BetDialogProps) {
  const { register, control, formState: {errors}, handleSubmit } = useForm<BetFormValues>({defaultValues: {
    outcomes: [],
  }});

  const dialogActions = <DialogActions>
    <Button autoFocus color="secondary" type="submit" form="bet-form">
      <Trans>Place bets</Trans>
    </Button>
  </DialogActions>

  return (
    <AppDialog
      open={open}
      handleClose={handleClose}
      title={t`Place your bets`}
      actions={dialogActions}
    >
      <BetForm {...{marketId: marketId, price, register, control, errors, handleSubmit}} />
    </AppDialog>
  );
}

export default BetDialog;
