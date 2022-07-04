import React, {useEffect, useState} from "react";
import {BoxWrapper, BoxRow, FormError, BoxLabelCell} from "../components"
import Button from '@mui/material/Button';
import {useFieldArray, useForm, useFormContext, useWatch, FormProvider} from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import {FormControl, MenuItem, Select} from "@mui/material";
import {FORMAT_GROUPS, getEncodedParams, TournamentFormats} from "../lib/curate";
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
import QuestionsList from "../components/CurateSubmit/QuestionsList";
import {CurateSubmitFormValues} from "../components/CurateSubmit";

function GroupsForm() {
  const { register, control, formState: { errors } } = useFormContext<CurateSubmitFormValues>();

  const useFieldGroupsArrayReturn = useFieldArray({control, name: `extraDataGroups.groups`});
  const {fields: groupsFields} = useFieldGroupsArrayReturn;

  const addGroup = () => {
    return useFieldGroupsArrayReturn.append({
      size: 0,
      name: '',
    })
  }

  const removeGroup = (groupIndex: number) => {
    return useFieldGroupsArrayReturn.remove(groupIndex)
  }

  return <>
  <BoxWrapper>
    <BoxRow>
      <BoxLabelCell>Groups</BoxLabelCell>
    </BoxRow>
    {groupsFields.length > 0 &&
    groupsFields.map((groupField, i) => {
        return <BoxRow key={groupField.id} style={{flexDirection: 'column'}}>
          <div style={{width: '100%', display: 'flex', padding: '5px 0'}}>
            <BoxLabelCell>Size</BoxLabelCell>
            <div style={{width: '100%', display: 'flex'}}>
              <TextField {...register(`extraDataGroups.groups.${i}.size`, {
                required: 'This field is required.',
                valueAsNumber: true,
                validate: v => !isNaN(Number(v)) || 'Invalid number.',
                min: {value: 1, message: 'Value must be greater than 0.'},
              })} style={{width: '100%'}} />
              <FormError><ErrorMessage errors={errors} name={`extraDataGroups.groups.${i}.size`} /></FormError>
            </div>
          </div>
          <div style={{width: '100%', display: 'flex', padding: '5px 0'}}>
            <BoxLabelCell>Name</BoxLabelCell>
            <div style={{width: '100%', display: 'flex'}}>
              <TextField {...register(`extraDataGroups.groups.${i}.name`, {
                required: 'This field is required.',
              })} style={{width: '100%'}} />
              <FormError><ErrorMessage errors={errors} name={`extraDataGroups.groups.${i}.name`} /></FormError>
            </div>
          </div>
          <div style={{width: '100%', textAlign: 'center', marginTop: '20px'}}><Button onClick={() => removeGroup(i)}>- Remove group</Button></div>
        </BoxRow>
      })}
    <BoxRow>
      <div style={{textAlign: 'center', width: '100%'}}><Button onClick={addGroup}>+ Add group</Button></div>
    </BoxRow>

    <BoxRow>
      <BoxLabelCell>Rounds</BoxLabelCell>
      <div style={{width: '100%'}}>
        <TextField {...register(`extraDataGroups.rounds`, {
          required: 'This field is required.',
          valueAsNumber: true,
          validate: v => !isNaN(Number(v)) || 'Invalid number.',
          min: {value: 1, message: 'Value must be greater than 0.'},
        })} />
        <FormError><ErrorMessage errors={errors} name={`extraDataGroups.rounds`} /></FormError>
      </div>
    </BoxRow>
  </BoxWrapper>
  </>
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
    questions: [],
    startingTimestamp: '',
    extraDataGroups: {
      groups: [],
      rounds: 0,
    },
  }});

  const { register, control, handleSubmit, formState: { errors }, setValue } = useFormReturn;

  const questionsUseFieldArrayReturn = useFieldArray({control, name: 'questions'});

  const format = useWatch({control, name: 'format'});

  const { state, send } = useContractFunction(new Contract(process.env.REACT_APP_CURATE_REGISTRY as string, GeneralizedTCR__factory.createInterface()), 'addItem');

  useEffect(() => {
    if (questionsUseFieldArrayReturn.fields.length > 0) {
      return;
    }

    const _questions = Object.values(rawQuestions || []);

    _questions.forEach(q => {
      questionsUseFieldArrayReturn.append({value: q.questionId})
    })

    setQuestions(_questions)
  }, [rawQuestions, questionsUseFieldArrayReturn]);

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
      questions.map(question => question.questionId)
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

      {format === FORMAT_GROUPS && <GroupsForm />}

      <BoxWrapper>
        {rawQuestions && <BoxRow>
          <div style={{width: '100%'}}>
            <QuestionsList useFieldArrayReturn={questionsUseFieldArrayReturn} rawQuestions={rawQuestions}/>
          </div>
        </BoxRow>}
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
