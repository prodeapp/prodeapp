import React from "react";
import {FormError} from "../../components"
import {FormControl} from "@mui/material";
import {useForm} from "react-hook-form";
import {ErrorMessage} from "@hookform/error-message";
import {useContractFunction, useEthers} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {KeyValue__factory} from "../../typechain";
import Alert from "@mui/material/Alert";
import {showWalletError} from "../../lib/helpers";
import CircularProgress from '@mui/material/CircularProgress';
import { Trans, t } from "@lingui/macro";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Player, PLAYER_FIELDS } from "../../graphql/subgraph";
import { apolloProdeQuery } from "../../lib/apolloClient";

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


const fetchPlayerByName = async (name: string) => {
  const query = `
    query PlayersNameQuery($playerName: String) {
        players(where: {name:$playerName}) {
            id
        }
    }
`;
  const response = await apolloProdeQuery<{ players: Player[] }>(query, {playerName: name});
  if (!response) throw new Error("No response from TheGraph");
  return response.data.players;
};

export default function ProfileForm({defaultName}: {defaultName: string}) {
  const { account, error: walletError } = useEthers();

  const { register, formState: {errors}, handleSubmit } = useForm<ProfileFormValues>({defaultValues: {
      name: defaultName,
    }});

  const { state, send } = useContractFunction(
    new Contract(process.env.REACT_APP_KEY_VALUE as string, KeyValue__factory.createInterface()),
    'setValue'
  );

  if (!account) {
    return null;
  }

  if (walletError) {
    return <div style={wrapperStyles}>
      <div style={innerStyles}>
        <Alert severity="error">{showWalletError(walletError)}</Alert>
      </div>
    </div>
  }

  if (state.status === 'Success') {
    return <div style={wrapperStyles}>
      <div style={innerStyles}>
        <Alert severity="success"><Trans>Username updated</Trans>!</Alert>
      </div>
    </div>
  }


  

  const onSubmit = async (data: ProfileFormValues) => {
    await send(
      'setName',
      data.name
    )
  }

  const isNameUnique = async (name:string) => {
    const names = await fetchPlayerByName(name)
    return names.length === 0
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={wrapperStyles}>

      {state.status === 'Mining' && <div style={{textAlign: 'center', margin: '15px 0'}}><CircularProgress /></div>}

      {state.status !== 'Mining' && <div style={innerStyles}>

        {state.errorMessage && <Alert severity="error" sx={{mb: 2}}>{state.errorMessage}</Alert>}

        <div style={{display: 'inline-flex', alignItems: 'center', margin: '0 auto'}}>
          <div style={{width: '410px', marginRight: '20px'}}>
            <FormControl fullWidth>
              <TextField {...register('name', {
                required: t`This field is required.`,
                validate: async (value) => await isNameUnique(value) || 'Name already in use, please select another name'
              })} placeholder={t`Your username`} error={!!errors.name} style={{width: '100%'}}/>
              <FormError><ErrorMessage errors={errors} name={`name`} /></FormError>
            </FormControl>
          </div>
          <div>
            <Button color="primary" type="submit">
              <Trans>Change username</Trans>
            </Button>
          </div>
        </div>
      </div>}
    </form>
  );
}
