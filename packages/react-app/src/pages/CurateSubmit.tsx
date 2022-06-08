import React, {useEffect, useState} from "react";
import {BoxWrapper, BoxRow, FormError, BoxLabelCell} from "../components"
import Button from '@mui/material/Button';
import {useForm} from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import {FormControl, MenuItem, Select} from "@mui/material";
import {getEncodedParams, TournamentFormats} from "../lib/curate";
import {getQuestionsHash} from "../lib/reality";
import {useContractFunction, useEthers} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {GeneralizedTCR__factory} from "../typechain";
import Input from "@mui/material/Input";
import {useParams} from "react-router-dom";
import Alert from "@mui/material/Alert";
import {useQuestions} from "../hooks/useQuestions";
import {Question} from "../graphql/subgraph";
import {useSubmissionDeposit} from "../hooks/useSubmissionDeposit";
import {useMarket} from "../hooks/useMarket";

export type CurateSubmitFormValues = {
  name: string
  description: string
  format: string
  startingTimestamp: string
}

function CurateSubmit() {

  const { marketId } = useParams();
  const { data: market } = useMarket(String(marketId));
  const { isLoading, data: rawQuestions } = useQuestions(String(marketId));
  const [questions, setQuestions] = useState<Question[]>([]);

  const { account, error: walletError } = useEthers();

  const submissionDeposit = useSubmissionDeposit();

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<CurateSubmitFormValues>({defaultValues: {
    name: '',
    description: '',
    format: '',
    startingTimestamp: '',
  }});

  const { state, send } = useContractFunction(new Contract(process.env.REACT_APP_CURATE_REGISTRY as string, GeneralizedTCR__factory.createInterface()), 'addItem');

  useEffect(() => {
    setQuestions(Object.values(rawQuestions || []))
  }, [rawQuestions]);

  useEffect(() => {
    if(market) {
      setValue('name', market.name)
      setValue('startingTimestamp', market.closingTime)
    }
  }, [market, setValue])

  if (!account || walletError) {
    return <Alert severity="error">{walletError?.message || 'Connect your wallet to verify a market.'}</Alert>
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!questions) {
    return <Alert severity="error">Market not found.</Alert>
  }

  const onSubmit = async (data: CurateSubmitFormValues) => {
    const encodedParams = await getEncodedParams(
      data,
      getQuestionsHash(questions.map(question => question.questionId)),
      questions.map(question => question.questionId) // TODO: change questions order
    )

    await send(
      encodedParams,
      {
        value: submissionDeposit
      }
    );
  }

  if (state.status === 'Success') {
    return <Alert severity="success">Market sent to Kleros Curate</Alert>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {state.errorMessage && <Alert severity="error" sx={{mb: 2}}>{state.errorMessage}</Alert>}
      <BoxWrapper>
        <BoxRow>
          <BoxLabelCell>Market name</BoxLabelCell>
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
            <Input {...register('description')} style={{width: '100%'}}/>
            <FormError><ErrorMessage errors={errors} name="description" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell>Starting timestamp</BoxLabelCell>
          <div style={{width: '100%'}}>
            <Input {...register('startingTimestamp', {
              required: 'This field is required.'
            })} style={{width: '100%'}}/>
            <FormError><ErrorMessage errors={errors} name="startingTimestamp" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell>Format</BoxLabelCell>
          <div style={{width: 200}}>
            <FormControl fullWidth>
              <Select
                defaultValue=""
                id={`market-format`}
                {...register(`format`, {required: 'This field is required.'})}
              >
                {Object.keys(TournamentFormats).map((format, i) => <MenuItem value={format} key={i}>{TournamentFormats[format]}</MenuItem>)}
              </Select>
              <FormError><ErrorMessage errors={errors} name={`format`} /></FormError>
            </FormControl>
          </div>
        </BoxRow>
        <BoxRow>
          <div style={{width: '100%'}}>
            {questions.map((question, i) => <div key={i}>{question.qTitle}</div>)}
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
