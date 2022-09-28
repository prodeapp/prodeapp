import React, {useEffect} from "react";
import {BoxWrapper, BoxRow, FormError, BoxLabelCell} from "../components"
import Button from '@mui/material/Button';
import {useFieldArray, useForm, useFormContext, useWatch, FormProvider} from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import {FormControl, MenuItem, Select} from "@mui/material";
import {FORMAT_GROUPS, getEncodedParams, TOURNAMENT_FORMATS} from "../lib/curate";
import {getQuestionsHash} from "../lib/reality";
import {useContractFunction, useEthers} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {GeneralizedTCR__factory} from "../typechain";
import TextField from '@mui/material/TextField';
import {useParams} from "react-router-dom";
import Alert from "@mui/material/Alert";
import {useEvents} from "../hooks/useEvents";
import {useSubmissionDeposit} from "../hooks/useSubmissionDeposit";
import {useMarket} from "../hooks/useMarket";
import EventsPreview from "../components/Curate/EventsPreview";
import {CurateSubmitFormValues} from "../components/Curate";
import { Trans, t } from "@lingui/macro";
import {showWalletError} from "../lib/helpers";

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
      <BoxLabelCell><Trans>Groups</Trans></BoxLabelCell>
    </BoxRow>
    {groupsFields.length > 0 &&
    groupsFields.map((groupField, i) => {
        return <BoxRow key={groupField.id} style={{flexDirection: 'column'}}>
          <div style={{width: '100%', display: 'flex', padding: '5px 0'}}>
            <BoxLabelCell><Trans>Number of questions</Trans></BoxLabelCell>
            <div style={{width: '100%', display: 'flex'}}>
              <TextField {...register(`extraDataGroups.groups.${i}.size`, {
                required: t`This field is required.`,
                valueAsNumber: true,
                validate: v => !isNaN(Number(v)) || 'Invalid number.',
                min: {value: 1, message: t`Value must be greater than 0.`},
              })} style={{width: '100%'}} />
              <FormError><ErrorMessage errors={errors} name={`extraDataGroups.groups.${i}.size`} /></FormError>
            </div>
          </div>
          <div style={{width: '100%', display: 'flex', padding: '5px 0'}}>
            <BoxLabelCell>Name</BoxLabelCell>
            <div style={{width: '100%', display: 'flex'}}>
              <TextField {...register(`extraDataGroups.groups.${i}.name`, {
                required: t`This field is required.`,
              })} style={{width: '100%'}} />
              <FormError><ErrorMessage errors={errors} name={`extraDataGroups.groups.${i}.name`} /></FormError>
            </div>
          </div>
          <div style={{width: '100%', textAlign: 'center', marginTop: '20px'}}><Button onClick={() => removeGroup(i)}>- <Trans>Remove group</Trans></Button></div>
        </BoxRow>
      })}
    <BoxRow>
      <div style={{textAlign: 'center', width: '100%'}}><Button onClick={addGroup}>+ <Trans>Add group</Trans></Button></div>
    </BoxRow>

    <BoxRow>
      <BoxLabelCell>Rounds</BoxLabelCell>
      <div style={{width: '100%'}}>
        <TextField {...register(`extraDataGroups.rounds`, {
          required: t`This field is required.`,
          valueAsNumber: true,
          validate: v => !isNaN(Number(v)) || t`Invalid number.`,
          min: {value: 1, message: t`Value must be greater than 0.`},
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

  const { account, error: walletError } = useEthers();

  const submissionDeposit = useSubmissionDeposit(process.env.REACT_APP_CURATE_REGISTRY as string);

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

  if (!account || walletError) {
    return <Alert severity="error">{showWalletError(walletError) || t`Connect your wallet to verify a market.`}</Alert>
  }

  if (isLoading) {
    return <div><Trans>Loading...</Trans></div>
  }

  if (!events) {
    return <Alert severity="error"><Trans>Market not found.</Trans></Alert>
  }

  const onSubmit = async (data: CurateSubmitFormValues) => {

    try {
      const encodedParams = await getEncodedParams(
        data,
        getQuestionsHash(data.questions.map(question => question.value)),
        data.questions.map(question => question.value)
      )

      await send(
        encodedParams,
        {
          value: submissionDeposit
        }
      );
    } catch (e: any) {
      alert(e?.message || t`Unexpected error`);
    }
  }

  if (state.status === 'Success') {
    return <Alert severity="success"><Trans>Market sent to Kleros Curate</Trans></Alert>
  }

  return <FormProvider {...useFormReturn}>
    <form onSubmit={handleSubmit(onSubmit)}>
      {state.errorMessage && <Alert severity="error" sx={{mb: 2}}>{state.errorMessage}</Alert>}
      <BoxWrapper>
        <BoxRow>
          <BoxLabelCell><Trans>Market name</Trans></BoxLabelCell>
          <div style={{width: '100%'}}>
            <TextField {...register('name', {
              required: t`This field is required.`
            })} style={{width: '100%'}}/>
            <FormError><ErrorMessage errors={errors} name="name" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell><Trans>Description</Trans></BoxLabelCell>
          <div style={{width: '100%'}}>
            <TextField {...register('description')} style={{width: '100%'}}/>
            <FormError><ErrorMessage errors={errors} name="description" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell><Trans>Starting timestamp</Trans></BoxLabelCell>
          <div style={{width: '100%'}}>
            <TextField {...register('startingTimestamp', {
              required: t`This field is required.`
            })} style={{width: '100%'}}/>
            <FormError><ErrorMessage errors={errors} name="startingTimestamp" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell><Trans>Format</Trans></BoxLabelCell>
          <div style={{width: 200}}>
            <FormControl fullWidth>
              <Select
                defaultValue=""
                id={`market-format`}
                {...register(`format`, {required: t`This field is required.`})}
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
            <Button type="submit"><Trans>Submit</Trans></Button>
          </div>
        </BoxRow>
      </BoxWrapper>
    </form>
  </FormProvider>
}

export default CurateSubmit;
