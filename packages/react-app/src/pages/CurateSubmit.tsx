import React from "react";
import {BoxWrapper, BoxRow, FormError, BoxLabelCell} from "../components"
import Button from '@mui/material/Button';
import {useForm} from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import {FormControl, MenuItem, Select} from "@mui/material";
import {getEncodedParams, TournamentFormats} from "../lib/curate";
import {getQuestionId, getQuestionsHash} from "../lib/reality";
import {useContractFunction} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {GeneralizedTCR__factory} from "../typechain";
import Input from "@mui/material/Input";
import {useParams} from "react-router-dom";
import Alert from "@mui/material/Alert";
import {useMatches} from "../hooks/useMatches";

export type CurateSubmitFormValues = {
  name: string
  description: string
  format: string
}

function CurateSubmit() {

  const { tournamentId } = useParams();
  const { isLoading, data: matches } = useMatches(String(tournamentId));

  const { register, handleSubmit, formState: { errors } } = useForm<CurateSubmitFormValues>({defaultValues: {
    name: '',
    description: '',
    format: '',
  }});

  const { state, send } = useContractFunction(new Contract(process.env.REACT_APP_TOURNAMENT_FACTORY as string, GeneralizedTCR__factory.createInterface()), 'addItem');

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!matches) {
    return <Alert severity="error">Tournament not found.</Alert>
  }

  const onSubmit = async (data: CurateSubmitFormValues) => {
    const submissionDeposit = 0; // TODO

    const encodedParams = await getEncodedParams(
      data,
      getQuestionsHash(matches.map(match => match.questionID)),
      matches.map(match => match.questionID) // TODO: change questions order
    )

    // TODO
    /*await send(
      encodedParams,
      {
        value: submissionDeposit
      }
    );*/
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <BoxWrapper>
        <BoxRow>
          <BoxLabelCell>Tournament name</BoxLabelCell>
          <div style={{width: '100%'}}>
            <Input {...register('name', {
              required: 'This field is required.'
            })} style={{width: '100%'}}/>
            <FormError><ErrorMessage errors={errors} name="name" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell>Description</BoxLabelCell>
          <div style={{width: '100%'}}>
            <Input {...register('description', {
              required: 'This field is required.'
            })} style={{width: '100%'}}/>
            <FormError><ErrorMessage errors={errors} name="description" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell>Format</BoxLabelCell>
          <div style={{width: 200}}>
            <FormControl fullWidth>
              <Select
                defaultValue=""
                id={`tournament-format`}
                {...register(`format`, {required: 'This field is required.'})}
              >
                {Object.keys(TournamentFormats).map((format, i) => <MenuItem value={format} key={i}>{TournamentFormats[format]}</MenuItem>)}
              </Select>
              <FormError><ErrorMessage errors={errors} name={`format`} /></FormError>
            </FormControl>
          </div>
        </BoxRow>
        <BoxRow>
          <div style={{textAlign: 'center', width: '100%', marginTop: '20px'}}>
            <Button type="submit">Submit</Button>
          </div>
        </BoxRow>
      </BoxWrapper>
    </form>
  );
}

export default CurateSubmit;
