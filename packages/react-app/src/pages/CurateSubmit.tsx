import React, {useEffect} from "react";
import {BoxWrapper, BoxRow, FormError, BoxLabelCell} from "../components"
import Button from '@mui/material/Button';
import {useFieldArray, useForm, useFormContext, useWatch, FormProvider} from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import {FormControl, MenuItem, Select} from "@mui/material";
import {FORMAT_GROUPS, getEncodedParams, TOURNAMENT_FORMATS} from "../lib/curate";
import {getQuestionsHash} from "../lib/reality";
import TextField from '@mui/material/TextField';
import {useParams} from "react-router-dom";
import Alert from "@mui/material/Alert";
import {useEvents} from "../hooks/useEvents";
import {useSubmissionDeposit} from "../hooks/useSubmissionDeposit";
import {useMarket} from "../hooks/useMarket";
import EventsPreview from "../components/Curate/EventsPreview";
import {CurateSubmitFormValues} from "../components/Curate";
import { Trans } from '@lingui/react'
import { i18n } from "@lingui/core"
import {getAccount} from "@wagmi/core";
import {useContractWrite, useNetwork} from "wagmi";
import {GeneralizedTCRAbi} from "../abi/GeneralizedTCR";
import {Address} from "@wagmi/core"

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
      <BoxLabelCell><Trans id="Groups" /></BoxLabelCell>
    </BoxRow>
    {groupsFields.length > 0 &&
    groupsFields.map((groupField, i) => {
        return <BoxRow key={groupField.id} style={{flexDirection: 'column'}}>
          <div style={{width: '100%', display: 'flex', padding: '5px 0'}}>
            <BoxLabelCell><Trans id="Number of questions" /></BoxLabelCell>
            <div style={{width: '100%', display: 'flex'}}>
              <TextField {...register(`extraDataGroups.groups.${i}.size`, {
                required: i18n._("This field is required."),
                valueAsNumber: true,
                validate: v => !isNaN(Number(v)) || 'Invalid number.',
                min: {value: 1, message: i18n._("Value must be greater than 0.")},
              })} style={{width: '100%'}} />
              <FormError><ErrorMessage errors={errors} name={`extraDataGroups.groups.${i}.size`} /></FormError>
            </div>
          </div>
          <div style={{width: '100%', display: 'flex', padding: '5px 0'}}>
            <BoxLabelCell>Name</BoxLabelCell>
            <div style={{width: '100%', display: 'flex'}}>
              <TextField {...register(`extraDataGroups.groups.${i}.name`, {
                required: i18n._("This field is required."),
              })} style={{width: '100%'}} />
              <FormError><ErrorMessage errors={errors} name={`extraDataGroups.groups.${i}.name`} /></FormError>
            </div>
          </div>
          <div style={{width: '100%', textAlign: 'center', marginTop: '20px'}}><Button onClick={() => removeGroup(i)}>- <Trans id="Remove group" /></Button></div>
        </BoxRow>
      })}
    <BoxRow>
      <div style={{textAlign: 'center', width: '100%'}}><Button onClick={addGroup}>+ <Trans id="Add group" /></Button></div>
    </BoxRow>

    <BoxRow>
      <BoxLabelCell>Rounds</BoxLabelCell>
      <div style={{width: '100%'}}>
        <TextField {...register(`extraDataGroups.rounds`, {
          required: i18n._("This field is required."),
          valueAsNumber: true,
          validate: v => !isNaN(Number(v)) || i18n._("Invalid number."),
          min: {value: 1, message: i18n._("Value must be greater than 0.")},
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
  const { isLoading, data: events } = useEvents(String(marketId));

  const {address} = getAccount();
  const { chain } = useNetwork()

  const {data: submissionDeposit} = useSubmissionDeposit(import.meta.env.VITE_CURATE_REGISTRY as Address);

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

  const { isSuccess, error, writeAsync } = useContractWrite({
    mode: 'recklesslyUnprepared',
    address: import.meta.env.VITE_CURATE_REGISTRY as Address,
    abi: GeneralizedTCRAbi,
    functionName: 'addItem',
  })

  useEffect(() => {
    if (questionsUseFieldArrayReturn.fields.length > 0 || !events) {
      return;
    }

    events.forEach(e => {
      questionsUseFieldArrayReturn.append({value: e.id})
    })
  // eslint-disable-next-line
  }, [events]);

  useEffect(() => {
    if(market) {
      setValue('name', market.name)
      setValue('startingTimestamp', market.closingTime)
    }
  }, [market, setValue])

  if (!address) {
    return <Alert severity="error">{i18n._("Connect your wallet to verify a market.")}</Alert>
  }

  if (!chain || chain.unsupported) {
    return <Alert severity="error"><Trans id="UNSUPPORTED_CHAIN" /></Alert>
  }

  if (isLoading) {
    return <div><Trans id="Loading..." /></div>
  }

  if (!events) {
    return <Alert severity="error"><Trans id="Market not found." /></Alert>
  }

  const onSubmit = async (data: CurateSubmitFormValues) => {

    try {
      const encodedParams = await getEncodedParams(
        data,
        getQuestionsHash(data.questions.map(question => question.value)),
        data.questions.map(question => question.value)
      )

      await writeAsync!({
        recklesslySetUnpreparedArgs: [
          encodedParams,
        ],
        recklesslySetUnpreparedOverrides: {
          value: submissionDeposit
        }
      });
    } catch (e: any) {
      alert(e?.message || i18n._("Unexpected error"));
    }
  }

  if (isSuccess) {
    return <Alert severity="success"><Trans id="Market sent to Kleros Curate" /></Alert>
  }

  return <FormProvider {...useFormReturn}>
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && <Alert severity="error" sx={{mb: 2}}>{error.message}</Alert>}
      <BoxWrapper>
        <BoxRow>
          <BoxLabelCell><Trans id="Market name" /></BoxLabelCell>
          <div style={{width: '100%'}}>
            <TextField {...register('name', {
              required: i18n._("This field is required.")
            })} style={{width: '100%'}}/>
            <FormError><ErrorMessage errors={errors} name="name" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell><Trans id="Description" /></BoxLabelCell>
          <div style={{width: '100%'}}>
            <TextField {...register('description')} style={{width: '100%'}}/>
            <FormError><ErrorMessage errors={errors} name="description" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell><Trans id="Starting timestamp" /></BoxLabelCell>
          <div style={{width: '100%'}}>
            <TextField {...register('startingTimestamp', {
              required: i18n._("This field is required.")
            })} style={{width: '100%'}}/>
            <FormError><ErrorMessage errors={errors} name="startingTimestamp" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell><Trans id="Format" /></BoxLabelCell>
          <div style={{width: 200}}>
            <FormControl fullWidth>
              <Select
                defaultValue=""
                id={`market-format`}
                {...register(`format`, {required: i18n._("This field is required.")})}
              >
                {Object.keys(TOURNAMENT_FORMATS).map((format, i) => <MenuItem value={format} key={i}>{TOURNAMENT_FORMATS[format]}</MenuItem>)}
              </Select>
              <FormError><ErrorMessage errors={errors} name={`format`} /></FormError>
            </FormControl>
          </div>
        </BoxRow>
      </BoxWrapper>

      {format === FORMAT_GROUPS && <GroupsForm />}

      <BoxWrapper>
        {events && format && <BoxRow>
          <div style={{width: '100%'}}>
            <EventsPreview useFieldArrayReturn={questionsUseFieldArrayReturn} events={events}/>
          </div>
        </BoxRow>}
        <BoxRow>
          <div style={{textAlign: 'center', width: '100%', marginTop: '20px'}}>
            <Button type="submit"><Trans id="Submit" /></Button>
          </div>
        </BoxRow>
      </BoxWrapper>
    </form>
  </FormProvider>
}

export default CurateSubmit;
