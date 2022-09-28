import React, {useEffect, useState} from "react";
import Button from '@mui/material/Button';
import {useForm} from "react-hook-form";
import AppDialog, {DialogProps} from "../../components/Dialog";
import DialogActions from "@mui/material/DialogActions";
import PlaceBidForm, {PlaceBidFormValues} from "./PlaceBidForm";
import { Trans } from "@lingui/macro";

type PlaceBidDialogProps = DialogProps & {
  itemId: string
  market: string
}

function PlaceBidDialog({open, handleClose, itemId, market}: PlaceBidDialogProps) {
  const { register, formState: {errors}, handleSubmit, setValue, watch } = useForm<PlaceBidFormValues>({defaultValues: {
      market: '',
      bid: 0,
      bidPerSecond: 0,
    }});

  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    setValue('market', market);
  }, [market, setValue]);

  const dialogActions = <DialogActions>
    <Button autoFocus color="primary" type="submit" form="place-bid-form">
    <Trans>Place Bid</Trans>
    </Button>
  </DialogActions>

  return (
    <AppDialog
      open={open}
      handleClose={handleClose}
      title={'Place bid'}
      actions={showActions && dialogActions}
    >
      <PlaceBidForm {...{itemId, register, errors, watch, handleSubmit, setShowActions}} />
    </AppDialog>
  );
}

export default PlaceBidDialog;
