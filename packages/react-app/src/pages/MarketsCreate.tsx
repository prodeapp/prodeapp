import React, {useEffect, useState} from "react";
import {BoxWrapper, BoxRow, BoxLabelCell, FormError} from "../components"
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import {MenuItem} from "@mui/material";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import {Controller, useFieldArray, useForm, FormProvider, useWatch} from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import PrizeWeightsBuilder from "../components/MarketCreate/PrizeWeightsBuilder";
import EventBuilder from "../components/MarketCreate/EventBuilder";
import useMarketForm, {getEventData, MarketFormStep1Values, MarketFormStep2Values} from "../hooks/useMarketForm";
import dateAdd from 'date-fns/add'
import { isAddress } from "@ethersproject/address";
import {useEthers} from "@usedapp/core";
import Alert from "@mui/material/Alert";
import {UseFormReturn} from "react-hook-form/dist/types";
import format from 'date-fns/format'
import {Link as RouterLink} from "react-router-dom";
import {getCategoryText, getMarketUrl, MARKET_CATEGORIES} from "../lib/helpers";
import { Trans, t } from "@lingui/macro";

export const formatAnswers = (answers: string[]) => {
  return answers.map(a => ({value: a}))
}

const DATE_FORMAT = 'yyyy-MM-dd hh:mm aaa'

const today = new Date();

interface FormStepProps<T> {
  useFormReturn: UseFormReturn<T>
  setActiveStep: (step: number) => void
}

interface PreviewStepProps {
  onSubmit: () => void
  step1State: MarketFormStep1Values
  step2State: MarketFormStep2Values
  setActiveStep: (step: number) => void
}

function Step1Form({useFormReturn, setActiveStep}: FormStepProps<MarketFormStep1Values>) {
  const { register, control, formState: { errors, isValid }, handleSubmit } = useFormReturn;

  const { fields: eventsFields, append: appendEvent, remove: removeEvent } = useFieldArray({control, name: 'events'});

  const category = useWatch({ control, name: `category` });

  const addEvent = () => {
    return appendEvent({
      questionPlaceholder: '',
      answers: formatAnswers(['', ''])
    })
  }

  const onSubmit = () => setActiveStep(1)

  return <FormProvider {...useFormReturn}>
    <form onSubmit={handleSubmit(onSubmit)}>
      <BoxWrapper>
        <BoxRow>
          <BoxLabelCell><Trans>Market Name</Trans></BoxLabelCell>
          <div style={{width: '100%'}}>
            <TextField {...register('market', {
              required: t`This field is required.`
            })} style={{width: '100%'}}/>
            <FormError><ErrorMessage errors={errors} name="market" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell><Trans>Category</Trans></BoxLabelCell>
          <div style={{width: '100%'}}>
            <TextField
              select
              value={category}
              {...register('category', {
                required: t`This field is required.`
              })}
              style={{width: '100%'}}>
              {MARKET_CATEGORIES.map((category, i) => <MenuItem value={category.id} key={i}>{category.text}</MenuItem>)}
            </TextField>
            <FormError><ErrorMessage errors={errors} name="category" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell><Trans>Betting Deadline (UTC)</Trans></BoxLabelCell>
          <div style={{textAlign: 'right'}}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Controller
                control={control}
                name='closingTime'
                rules={{required: t`This field is required`}}
                render={({ field }) => (
                  <DateTimePicker
                    label={t`Select date`}
                    minDate={today}
                    onChange={field.onChange}
                    value={field.value}
                    inputFormat={DATE_FORMAT}
                    renderInput={(params) => <TextField {...params} />}
                  />
                )}
              />
            </LocalizationProvider>
            <FormHelperText><Trans>Bets will not be accepted passed this time. It should be before the beginning of the first event.</Trans></FormHelperText>
            <FormError><ErrorMessage errors={errors} name="closingTime" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell><Trans>Events</Trans></BoxLabelCell>
        </BoxRow>
        {eventsFields.length > 0 &&
        <BoxRow style={{flexDirection: 'column'}}>
          {eventsFields.map((questionField, i) => {
            return (
              <div key={questionField.id} style={{padding: '10px', minWidth: '100%'}}>
                <EventBuilder
                  eventIndex={i}
                  {...{removeEvent}}
                />
              </div>
            )
          })}
        </BoxRow>
        }
        <BoxRow>
          <div style={{textAlign: 'center', width: '100%'}}><Button onClick={addEvent}>+ <Trans>Add event</Trans></Button></div>
        </BoxRow>
      </BoxWrapper>

      {isValid && eventsFields.length > 0 && <div style={{textAlign: 'center', width: '100%', marginBottom: '20px'}}>
        <Button type="submit"><Trans>Next step</Trans></Button>
      </div>}
    </form>
  </FormProvider>
}

function Step2Form({useFormReturn, setActiveStep}: FormStepProps<MarketFormStep2Values>) {
  const { register, formState: {errors, isValid}, handleSubmit } = useFormReturn;

  useEffect(() => {
    useFormReturn.register('prizeDivisor', {
      validate: value => value === 100 || t`The sum of prize weights must be 100.`
    });
  }, [useFormReturn]);

  const onSubmit = () => setActiveStep(2)

  return <FormProvider {...useFormReturn}>
    <form onSubmit={handleSubmit(onSubmit)}>
      <BoxWrapper>
        <BoxRow>
          <BoxLabelCell><Trans>Bet Price (xDAI)</Trans></BoxLabelCell>
          <div style={{width: '100%'}}>
            <TextField {...register('price', {
              required: t`This field is required.`,
              valueAsNumber: true,
              validate: v => !isNaN(Number(v)) || t`Invalid number.`,
              min: { value: 0.01, message: t`Price must be greater than 0.01` }
            })} style={{width: '100%'}} />
            <FormError><ErrorMessage errors={errors} name="price" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell><Trans>Manager</Trans></BoxLabelCell>
          <div style={{width: '100%'}}>
            <TextField {...register('manager', {
              required: t`This field is required.`,
              validate: v => isAddress(v) || 'Invalid address.',
            })} style={{width: '100%'}} />
            <FormHelperText><Trans>Address to send management fees to.</Trans></FormHelperText>
            <FormError><ErrorMessage errors={errors} name="manager" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell><Trans>Management Fee (%)</Trans></BoxLabelCell>
          <div style={{width: '100%'}}>
            <TextField {...register('managementFee', {
              required: t`This field is required.`,
              valueAsNumber: true,
              validate: v => !isNaN(Number(v)) || 'Invalid number.',
              min: {value: 0, message: t`Fee must be greater than 0.`},
              max: {value: 100, message: t`Fee must be lower than 100.`}
            })} style={{width: '100%'}} />
            <FormHelperText><Trans>The manager will receive this percentage of the pool as reward. In addition, the market creator will be rewarded when bets are traded on NFT marketplaces.</Trans></FormHelperText>
            <FormError><ErrorMessage errors={errors} name="managementFee" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell><Trans>Prize Distribution (%)</Trans></BoxLabelCell>
          <PrizeWeightsBuilder />
        </BoxRow>
      </BoxWrapper>

      {isValid && <div style={{textAlign: 'center', width: '100%', marginBottom: '20px'}}>
        <div><Button type="submit"><Trans>Next step</Trans></Button></div>
        <Button variant="text" onClick={()=> setActiveStep(0)}><Trans>Go to step</Trans> 1</Button>
      </div>}
    </form>
  </FormProvider>
}

function PreviewText({title, value, setActiveStep, step}: {title: string, value: string|number, setActiveStep: (step: number) => void, step: number}) {
  return <div style={{display: 'flex', justifyItems: 'space-between', marginBottom: '20px'}}>
    <div style={{flexGrow: 1, border: '1px solid #ccc', padding: '15px'}}>
      <div style={{opacity: '0.85'}}>{title}</div>
      <div dangerouslySetInnerHTML={{__html: String(value)}}></div>
    </div>
    <div style={{display: 'flex'}}><Button variant="text" onClick={()=> setActiveStep(step)}><Trans>Edit</Trans></Button></div>
  </div>
}

function PreviewEvents({step1State, setActiveStep}: {step1State: MarketFormStep1Values, setActiveStep: (step: number) => void}) {
  return <div style={{marginLeft: '20px'}}>
    {step1State.events.map((event, i) => {
      const eventData = getEventData(event.questionPlaceholder, event.answers, step1State.market);
      return <PreviewText key={i} title={eventData.question} value={eventData.answers.join(', ')} setActiveStep={setActiveStep} step={0} />
    })}
  </div>
}

function PreviewStep({onSubmit, step1State, step2State, setActiveStep}: PreviewStepProps) {
  return <div>

    <h2><Trans>Review the market data</Trans></h2>

    <PreviewText title={t`Market Name`} value={step1State.market} setActiveStep={setActiveStep} step={0} />

    <PreviewText title={t`Category`} value={getCategoryText(step1State.category)} setActiveStep={setActiveStep} step={0} />

    <div style={{fontWeight: 'bold', marginBottom: '10px'}}><Trans>Events</Trans></div>
    <PreviewEvents step1State={step1State} setActiveStep={setActiveStep} />

    <PreviewText title={t`Betting Deadline (UTC)`} value={format(step1State.closingTime, DATE_FORMAT)} setActiveStep={setActiveStep} step={0} />

    <PreviewText title={t`Bet Price`} value={`${step2State.price} xDAI`} setActiveStep={setActiveStep} step={1} />

    <PreviewText title={t`Manager`} value={step2State.manager} setActiveStep={setActiveStep} step={1} />

    <PreviewText title={t`Management Fee`} value={`${step2State.managementFee}%`} setActiveStep={setActiveStep} step={1} />

    <PreviewText title={t`Prizes`} value={step2State.prizeWeights.map((p, i) => `#${i+1}: ${p.value}%`).join('<br />')} setActiveStep={setActiveStep} step={1} />

    <div style={{textAlign: 'center', width: '100%', marginTop: '20px'}}>
      <div><Button onClick={onSubmit}><Trans>Create Market</Trans></Button></div>
      <div><Button variant="text" onClick={()=> setActiveStep(1)}><Trans>Go to step</Trans> 2</Button></div>
    </div>
  </div>
}

function SuccessStep({marketName, marketId}: {marketName: string, marketId: string}) {
  const message = t`I have created a new market on @prode_eth: ${marketName} ${getMarketUrl(marketId)}`

  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`

  return <div>
    <BoxWrapper sx={{display: 'flex', justifyContent: 'space-between', padding: 2}}>
      <div>
        <div><Trans>Congratulations!</Trans></div>
        <div><Trans>The market was successfully created and is ready to take bets.</Trans></div>
      </div>
      <div>
        <Button component={Link} href={shareUrl} target="_blank" rel="noopener">Share on Twitter</Button>
      </div>
    </BoxWrapper>

    <Grid container spacing={2}>
      <Grid item xs={6} md={6}>
        <BoxWrapper sx={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', textAlign: 'center', padding: 2}}>
          <h3><Trans>Verify your market</Trans></h3>
          <div style={{margin: '15px 0'}}>[REASONS...]</div>
          <div><Button component={RouterLink} to={`/curate/submit/${marketId}`}><Trans>Verify market</Trans></Button></div>
        </BoxWrapper>
      </Grid>
      <Grid item xs={6} md={6}>
        <BoxWrapper sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: 2}}>
          <div><Button component={RouterLink} to={`/markets/${marketId}`}><Trans>Go to the market</Trans></Button></div>
        </BoxWrapper>
      </Grid>
    </Grid>
  </div>
}

function MarketsCreate() {
  const { account, error: walletError } = useEthers();
  const [activeStep, setActiveStep] = useState(0);

  const defaultClosingTime = dateAdd(today, {days: 5});
  const useForm1Return = useForm<MarketFormStep1Values>({
    mode: 'all',
    defaultValues: {
      market: '',
      category: '',
      closingTime: defaultClosingTime,
      events: [],
    }
  });

  const useForm2Return = useForm<MarketFormStep2Values>({
    mode: 'all',
    defaultValues: {
      prizeWeights: [{value: 50}, {value: 30}, {value: 20}],
      prizeDivisor: 0,
      manager: '',
      managementFee: 1.5
    }
  });

  const step1State = useForm1Return.getValues();
  const step2State = useForm2Return.getValues();

  const {state, createMarket, marketId} = useMarketForm();

  const onSubmit = async () => {
    if (step1State && step2State) {
      await createMarket(step1State, step2State);
    }
  }

  useEffect(() => {
    if (state.status === 'Success') {
      setActiveStep(3)
    }
  }, [state]);

  useEffect(() => {
    if (step2State.manager === '') {
      useForm2Return.setValue('manager', account || '');
    }
  // eslint-disable-next-line
  }, [account]);

  if (!account || walletError) {
    return <Alert severity="error">{walletError?.message || <Trans>Connect your wallet to create a market.</Trans>}</Alert>
  }

  return <>
    {activeStep < 3 && <div style={{marginBottom: 20}}>
      <Stepper activeStep={activeStep} alternativeLabel>
        <Step><StepLabel><Trans>Market</Trans></StepLabel></Step>
        <Step><StepLabel><Trans>Price</Trans></StepLabel></Step>
        <Step><StepLabel><Trans>Publish</Trans></StepLabel></Step>
      </Stepper>
    </div>}

    {state.errorMessage && <Alert severity="error" sx={{mb: 2}}>{state.errorMessage}</Alert>}

    {activeStep === 0 && <Step1Form useFormReturn={useForm1Return} setActiveStep={setActiveStep} />}

    {activeStep === 1 && <Step2Form useFormReturn={useForm2Return} setActiveStep={setActiveStep} />}

    {activeStep === 2 && <PreviewStep onSubmit={onSubmit} setActiveStep={setActiveStep} step1State={step1State} step2State={step2State} />}

    {activeStep === 3 && <SuccessStep marketName={step1State.market} marketId={marketId} />}
  </>
}

export default MarketsCreate;
