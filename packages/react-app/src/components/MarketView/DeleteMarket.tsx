import React from "react";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import { Trans } from '@lingui/react';
import {useContractWrite} from "wagmi";
import {KeyValueAbi} from "../../abi/KeyValue";
import {Address} from "@wagmi/core"

function DeleteMarket({marketId}: {marketId: string}) {
  const { isSuccess, write } = useContractWrite({
    mode: 'recklesslyUnprepared',
    address: import.meta.env.VITE_KEY_VALUE as Address,
    abi: KeyValueAbi,
    functionName: 'setValue',
  })

  const deleteMarket = async () => {
    await write!({
      recklesslySetUnpreparedArgs: [
        'deleteMarket',
        marketId
      ]
    });
  }

  if (isSuccess) {
    return <Alert severity="success"><Trans id="This market has been deleted." /></Alert>
  }

  return <Button variant="text" size="small" color="error" onClick={deleteMarket}><Trans id="Delete market" /></Button>
}

export default DeleteMarket;
