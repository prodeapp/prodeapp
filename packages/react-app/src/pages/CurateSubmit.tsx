import React, {useEffect, useState} from "react";
import {BoxWrapper, BoxRow, FormError, BoxLabelCell} from "../components"
import Button from '@mui/material/Button';
import {useFieldArray, useForm, useFormContext, useWatch, FormProvider} from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import {FormControl, MenuItem, Select} from "@mui/material";
import {FORMAT_GROUPS, FORMAT_ROUND_ROBIN, getEncodedParams, TournamentFormats} from "../lib/curate";
import {getQuestionsHash} from "../lib/reality";
import {useContractFunction, useEthers} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {GeneralizedTCR__factory} from "../typechain";
import TextField from '@mui/material/TextField';
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
  extraDataRoundRobin: {
    totalTournaments: number
    competitors: number
    rounds: number
    names: {value: string}[]
  }
  extraDataGroups: {
    // TODO: groups can also be number[] if there are subgroups
    groups: number
    sizes: {value: number|''}[]
    names: {value: string}[]
  }
}

function RoundRobinForm() {
  const { register, control, formState: { errors } } = useFormContext<CurateSubmitFormValues>();

  const {
    fields: names,
    append: appendNameField,
    remove: removeNameField
  } = useFieldArray({control, name: `extraDataRoundRobin.names`});

  const tournaments = useWatch({control, name: 'extraDataRoundRobin.totalTournaments'});

  useEffect(() => {
    if (names.length > tournaments) {
      const to = names.length
      for(let i = tournaments; i < to; i++) {
        removeNameField(i);
      }
    } else if (names.length < tournaments) {
      const from = names.length
      for(let i = from; i < tournaments; i++) {
        appendNameField({value: ''});
      }
    }
    // eslint-disable-next-line
  }, [tournaments, names]);


  return <BoxWrapper>
    <BoxRow>
      <BoxLabelCell>Total Tournaments</BoxLabelCell>
      <div style={{width: '100%'}}>
        <TextField {...register('extraDataRoundRobin.totalTournaments', {
          required: 'This field is required.',
          valueAsNumber: true,
          validate: v => !isNaN(Number(v)) || 'Invalid number.',
          min: {value: 1, message: 'Value must be greater than 0.'},
        })} style={{width: '100%'}}/>
        <FormError><ErrorMessage errors={errors} name="extraDataRoundRobin.totalTournaments" /></FormError>
      </div>
    </BoxRow>
    <BoxRow>
      <BoxLabelCell>Competitors</BoxLabelCell>
      <div style={{width: '100%'}}>
        <TextField {...register('extraDataRoundRobin.competitors', {
          required: 'This field is required.',
          valueAsNumber: true,
          validate: v => !isNaN(Number(v)) || 'Invalid number.',
          min: {value: 1, message: 'Value must be greater than 0.'},
        })} style={{width: '100%'}}/>
        <FormError><ErrorMessage errors={errors} name="extraDataRoundRobin.competitors" /></FormError>
      </div>
    </BoxRow>
    <BoxRow>
      <BoxLabelCell>Rounds</BoxLabelCell>
      <div style={{width: '100%'}}>
        <TextField {...register('extraDataRoundRobin.rounds', {
          required: 'This field is required.',
          valueAsNumber: true,
          validate: v => !isNaN(Number(v)) || 'Invalid number.',
          min: {value: 1, message: 'Value must be greater than 0.'},
        })} style={{width: '100%'}}/>
        <FormError><ErrorMessage errors={errors} name="extraDataRoundRobin.rounds" /></FormError>
      </div>
    </BoxRow>
    {names.length > 0 && <BoxRow>
      <BoxLabelCell>Tournaments Names</BoxLabelCell>
      <div style={{width: '100%'}}>
        {names.map((_, i) => {
          return <div key={i} style={{margin: '0 5px 0 0'}}>
            <TextField {...register(`extraDataRoundRobin.names.${i}.value`, {required: 'This field is required.'})} placeholder={`Tournament ${i+1}`} />
            <FormError><ErrorMessage errors={errors} name={`extraDataRoundRobin.names.${i}.value`} /></FormError>
          </div>
        })}
      </div>
    </BoxRow>}
  </BoxWrapper>
}

function GroupsForm() {
  const { register, control, formState: { errors } } = useFormContext<CurateSubmitFormValues>();

  const {
    fields: names,
    append: appendNameField,
    remove: removeNameField
  } = useFieldArray({control, name: `extraDataGroups.names`});

  const {
    fields: sizes,
    append: appendSizeField,
    remove: removeSizeField
  } = useFieldArray({control, name: `extraDataGroups.sizes`});

  const groups = useWatch({control, name: 'extraDataGroups.groups'});

  useEffect(() => {
    if (names.length > groups) {
      const to = names.length
      for(let i = groups; i < to; i++) {
        removeNameField(i);
      }
    } else if (names.length < groups) {
      const from = names.length
      for(let i = from; i < groups; i++) {
        appendNameField({value: ''});
      }
    }
    // eslint-disable-next-line
  }, [groups, names]);

  useEffect(() => {
    if (sizes.length > groups) {
      const to = sizes.length
      for(let i = groups; i < to; i++) {
        removeSizeField(i);
      }
    } else if (sizes.length < groups) {
      const from = sizes.length
      for(let i = from; i < groups; i++) {
        appendSizeField({value: ''});
      }
    }
    // eslint-disable-next-line
  }, [groups, sizes]);

  return <BoxWrapper>
    <BoxRow>
      <BoxLabelCell>Total Groups</BoxLabelCell>
      <div style={{width: '100%'}}>
        <TextField {...register('extraDataGroups.groups', {
          required: 'This field is required.',
          valueAsNumber: true,
          validate: v => !isNaN(Number(v)) || 'Invalid number.',
          min: {value: 1, message: 'Value must be greater than 0.'},
        })} style={{width: '100%'}}/>
        <FormError><ErrorMessage errors={errors} name="extraDataGroups.groups" /></FormError>
      </div>
    </BoxRow>
    {sizes.length > 0 && <BoxRow>
      <BoxLabelCell>Groups Sizes</BoxLabelCell>
      <div style={{width: '100%'}}>
        {sizes.map((_, i) => {
          return <div key={i} style={{margin: '0 5px 0 0'}}>
            <TextField {...register(`extraDataGroups.sizes.${i}.value`, {
              required: 'This field is required.',
              valueAsNumber: true,
              validate: v => !isNaN(Number(v)) || 'Invalid number.',
              min: {value: 1, message: 'Value must be greater than 0.'},
            })} placeholder={`Group ${i+1}`} />
            <FormError><ErrorMessage errors={errors} name={`extraDataGroups.sizes.${i}.value`} /></FormError>
          </div>
        })}
      </div>
    </BoxRow>}

    {names.length > 0 && <BoxRow>
      <BoxLabelCell>Groups Names</BoxLabelCell>
      <div style={{width: '100%'}}>
        {names.map((_, i) => {
          return <div key={i} style={{margin: '0 5px 0 0'}}>
            <TextField {...register(`extraDataGroups.names.${i}.value`, {required: 'This field is required.'})} placeholder={`Group ${i+1}`} />
            <FormError><ErrorMessage errors={errors} name={`extraDataGroups.names.${i}.value`} /></FormError>
          </div>
        })}
      </div>
    </BoxRow>}
  </BoxWrapper>
}

function CurateSubmit() {

  const { marketId } = useParams();
  const { data: market } = useMarket(String(marketId));
  const { isLoading, data: rawQuestions } = useQuestions(String(marketId));
  const [questions, setQuestions] = useState<Question[]>([]);

  const { account, error: walletError } = useEthers();

  const submissionDeposit = useSubmissionDeposit();

  const useFormReturn = useForm<CurateSubmitFormValues>({defaultValues: {
    name: '',
    description: '',
    format: '',
    startingTimestamp: '',
    extraDataRoundRobin: {
      totalTournaments: 0,
      competitors: 0,
      rounds: 0,
      names: [],
    }
  }});

  const { register, control, handleSubmit, formState: { errors }, setValue } = useFormReturn;

  const format = useWatch({control, name: 'format'});

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

  return <FormProvider {...useFormReturn}>
    <form onSubmit={handleSubmit(onSubmit)}>
      {state.errorMessage && <Alert severity="error" sx={{mb: 2}}>{state.errorMessage}</Alert>}
      <BoxWrapper>
        <BoxRow>
          <BoxLabelCell>Market name</BoxLabelCell>
          <div style={{width: '100%'}}>
            <TextField {...register('name', {
              required: 'This field is required.'
            })} style={{width: '100%'}}/>
            <FormError><ErrorMessage errors={errors} name="name" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell>Description</BoxLabelCell>
          <div style={{width: '100%'}}>
            <TextField {...register('description')} style={{width: '100%'}}/>
            <FormError><ErrorMessage errors={errors} name="description" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell>Starting timestamp</BoxLabelCell>
          <div style={{width: '100%'}}>
            <TextField {...register('startingTimestamp', {
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
      </BoxWrapper>

      {format === FORMAT_ROUND_ROBIN && <RoundRobinForm />}

      {format === FORMAT_GROUPS && <GroupsForm />}

      <BoxWrapper>
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
  </FormProvider>
}

export default CurateSubmit;
