import React from "react";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import {useContractFunction} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {KeyValue__factory} from "../../typechain";
import {Trans} from "@lingui/macro";

function DeleteMarket({marketId}: {marketId: string}) {
  const { state, send } = useContractFunction(
    new Contract(process.env.REACT_APP_KEY_VALUE as string, KeyValue__factory.createInterface()),
    'setValue'
  );

  const deleteMarket = async () => {
    await send(
      'deleteMarket',
      marketId
    );
  }

  if (state.status === 'Success') {
    return <Alert severity="success"><Trans>This market has been deleted.</Trans></Alert>
  }

  return <Button variant="text" size="small" color="error" onClick={deleteMarket}><Trans>Delete market</Trans></Button>
}

export default DeleteMarket;
