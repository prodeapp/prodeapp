import React from "react";
import {FormError} from "../../components"
import {FormControl} from "@mui/material";
import {useForm} from "react-hook-form";
import {ErrorMessage} from "@hookform/error-message";
import {Contract} from "@ethersproject/contracts";
import Alert from "@mui/material/Alert";
import CircularProgress from '@mui/material/CircularProgress';
import { Trans } from '@lingui/react'
import { i18n } from "@lingui/core";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Player, PLAYER_FIELDS } from "../../graphql/subgraph";
import { apolloProdeQuery } from "../../lib/apolloClient";
import {getAccount} from "@wagmi/core";
import {useContractWrite, useNetwork} from "wagmi";
import {ManagerAbi} from "../../abi/Manager";
import {KeyValueAbi} from "../../abi/KeyValue";
import {Address} from "@wagmi/core"

export type ProfileFormValues = {
  name: string
}

const wrapperStyles: React.CSSProperties = {
  textAlign: 'center',
  borderTop: '1px solid #969696',
  borderBottom: '1px solid #969696',
  marginBottom: '30px',
}
const innerStyles: React.CSSProperties = {
  maxWidth: '640px',
  margin: '0 auto',
  padding: '15px',
};

const fetchPlayerByName = async (name: string): Promise<Player | undefined> => {
  const query = `
    ${PLAYER_FIELDS}
    query PlayersNameQuery($playerName: String) {
        players(where: {name:$playerName}) {
            ...PlayerFields
        }
    }
`;
  const response = await apolloProdeQuery<{ players: Player[] }>(query, {playerName: name});
  if (!response) throw new Error("No response from TheGraph");
  return response.data.players[0];
};

export default function ProfileForm({defaultName}: {defaultName: string}) {
  const {address} = getAccount();
  const { chain } = useNetwork()

  const { register, formState: {errors}, handleSubmit } = useForm<ProfileFormValues>({defaultValues: {
      name: defaultName,
    }});

  const { isLoading, isSuccess, error, writeAsync } = useContractWrite({
    mode: 'recklesslyUnprepared',
    address: import.meta.env.VITE_KEY_VALUE as Address,
    abi: KeyValueAbi,
    functionName: 'setValue',
  })

  if (!address) {
    return null;
  }

  if (!chain || chain.unsupported) {
    return <div style={wrapperStyles}>
      <div style={innerStyles}>
        <Alert severity="error"><Trans id="UNSUPPORTED_CHAIN" /></Alert>
      </div>
    </div>
  }

  if (isSuccess) {
    return <div style={wrapperStyles}>
      <div style={innerStyles}>
        <Alert severity="success"><Trans id="Username updated" />!</Alert>
      </div>
    </div>
  }

  const onSubmit = async (data: ProfileFormValues) => {
    await writeAsync!({
      recklesslySetUnpreparedArgs: [
        'setName',
        data.name
      ]
    })
  }

  const isNameUnique = async (name: string) => {
    return (await fetchPlayerByName(name)) === undefined;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={wrapperStyles}>

      {isLoading && <div style={{textAlign: 'center', margin: '15px 0'}}><CircularProgress /></div>}

      {!isLoading && <div style={innerStyles}>

        {error && <Alert severity="error" sx={{mb: 2}}>{error.message}</Alert>}

        <div style={{display: 'inline-flex', alignItems: 'center', margin: '0 auto'}}>
          <div style={{width: '410px', marginRight: '20px'}}>
            <FormControl fullWidth>
              <TextField {...register('name', {
                required: i18n._("This field is required."),
                validate: async (value) => await isNameUnique(value) || 'Name already in use, please select another name'
              })} placeholder={i18n._("Your username")} error={!!errors.name} style={{width: '100%'}}/>
              <FormError><ErrorMessage errors={errors} name={`name`} /></FormError>
            </FormControl>
          </div>
          <div>
            <Button color="primary" type="submit">
              <Trans id="Change username" />
            </Button>
          </div>
        </div>
      </div>}
    </form>
  );
}
