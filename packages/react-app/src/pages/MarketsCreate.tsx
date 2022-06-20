import React, {useEffect, useState} from "react";
import {BoxWrapper, BoxRow, BoxLabelCell, FormError} from "../components"
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import {Controller, useFieldArray, useForm, FormProvider} from "react-hook-form";
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

export const formatAnswers = (answers: string[]) => {
  return answers.map(a => ({value: a}))
}

const DATE_FORMAT = 'yyyy-MM-dd hh:mm aaa'

const today = new Date();

interface Step1Props {
  onSubmit: (data: MarketFormStep1Values) => void
  useFormReturn: UseFormReturn<MarketFormStep1Values>
}

interface Step2Props {
  onSubmit: (data: MarketFormStep2Values) => void
  useFormReturn: UseFormReturn<MarketFormStep2Values>
  setActiveStep: (step: number) => void
}

interface Step3Props {
  onSubmit: () => void
  step1State: MarketFormStep1Values
  step2State: MarketFormStep2Values
  setActiveStep: (step: number) => void
}

function Step1Form({onSubmit, useFormReturn}: Step1Props) {
  const { register, control, formState: { errors, isValid }, handleSubmit } = useFormReturn;

  const { fields: eventsFields, append: appendEvent, remove: removeEvent } = useFieldArray({control, name: 'events'});

  const addEvent = () => {
    return appendEvent({
      questionPlaceholder: '',
      answers: formatAnswers(['', ''])
    })
  }

  return <FormProvider {...useFormReturn}>
    <form onSubmit={handleSubmit(onSubmit)}>
      <BoxWrapper>
        <BoxRow>
          <BoxLabelCell>Market Name</BoxLabelCell>
          <div style={{width: '100%'}}>
            <TextField {...register('market', {
              required: 'This field is required.'
            })} style={{width: '100%'}}/>
            <FormError><ErrorMessage errors={errors} name="market" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell>Betting Deadline (UTC)</BoxLabelCell>
          <div style={{textAlign: 'right'}}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Controller
                control={control}
                name='closingTime'
                rules={{required: 'This field is required'}}
                render={({ field }) => (
                  <DateTimePicker
                    label='Select date'
                    minDate={today}
                    onChange={field.onChange}
                    value={field.value}
                    inputFormat={DATE_FORMAT}
                    renderInput={(params) => <TextField {...params} />}
                  />
                )}
              />
            </LocalizationProvider>
            <FormHelperText>Bets will not be accepted passed this time. It should be before the beginning of the first event.</FormHelperText>
            <FormError><ErrorMessage errors={errors} name="closingTime" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell>Events</BoxLabelCell>
          <div><Button onClick={addEvent}>+ Add event</Button></div>
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
      </BoxWrapper>

      {isValid && eventsFields.length > 0 && <div style={{textAlign: 'center', width: '100%', marginBottom: '20px'}}>
        <Button type="submit">Next step</Button>
      </div>}
    </form>
  </FormProvider>
}

function Step2Form({onSubmit, useFormReturn, setActiveStep}: Step2Props) {
  const { register, formState: {errors, isValid}, handleSubmit } = useFormReturn;

  useEffect(() => {
    useFormReturn.register('prizeDivisor', {
      validate: value => value === 100 || 'The sum of prize weights must be 100.'
    });
  }, [useFormReturn]);

  return <FormProvider {...useFormReturn}>
    <form onSubmit={handleSubmit(onSubmit)}>
      <BoxWrapper>
        <BoxRow>
          <BoxLabelCell>Bet Price (xDAI)</BoxLabelCell>
          <div style={{width: '100%'}}>
            <TextField {...register('price', {
              required: 'This field is required.',
              valueAsNumber: true,
              validate: v => !isNaN(Number(v)) || 'Invalid number.',
              min: { value: 0.01, message: 'Price must be greater than 0.01' }
            })} style={{width: '100%'}} />
            <FormError><ErrorMessage errors={errors} name="price" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell>Manager</BoxLabelCell>
          <div style={{width: '100%'}}>
            <TextField {...register('manager', {
              required: 'This field is required.',
              validate: v => isAddress(v) || 'Invalid address.',
            })} style={{width: '100%'}} />
            <FormHelperText>Address to send management fees to.</FormHelperText>
            <FormError><ErrorMessage errors={errors} name="manager" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell>Management Fee (%)</BoxLabelCell>
          <div style={{width: '100%'}}>
            <TextField {...register('managementFee', {
              required: 'This field is required.',
              valueAsNumber: true,
              validate: v => !isNaN(Number(v)) || 'Invalid number.',
              min: {value: 0, message: 'Fee must be greater than 0.'},
              max: {value: 100, message: 'Fee must be lower than 100.'}
            })} style={{width: '100%'}} />
            <FormHelperText>The manager will receive this percentage of the pool as reward. In addition, the market creator will be rewarded when bets are traded on NFT marketplaces. UI providers may apply this fee as well for each bet.</FormHelperText>
            <FormError><ErrorMessage errors={errors} name="managementFee" /></FormError>
          </div>
        </BoxRow>
        <BoxRow>
          <BoxLabelCell>Prize Distribution (%)</BoxLabelCell>
          <PrizeWeightsBuilder />
        </BoxRow>
      </BoxWrapper>

      {isValid && <div style={{textAlign: 'center', width: '100%', marginBottom: '20px'}}>
        <div><Button type="submit">Next step</Button></div>
        <Button variant="text" onClick={()=> setActiveStep(0)}>Go to step 1</Button>
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
    <div style={{display: 'flex'}}><Button variant="text" onClick={()=> setActiveStep(step)}>Edit</Button></div>
  </div>
}

function PreviewEvents({step1State, setActiveStep}: {step1State: MarketFormStep1Values, setActiveStep: (step: number) => void}) {
  return <div style={{marginLeft: '20px'}}>
    {step1State.events.map(event => {
      const eventData = getEventData(event.questionPlaceholder, event.answers, step1State.market);
      return <PreviewText title={eventData.question} value={eventData.answers.join(', ')} setActiveStep={setActiveStep} step={0} />
    })}
  </div>
}

function Step3Form({onSubmit, step1State, step2State, setActiveStep}: Step3Props) {
  return <div>
    <PreviewText title="Market Name" value={step1State.market} setActiveStep={setActiveStep} step={0} />

    <div style={{fontWeight: 'bold', marginBottom: '10px'}}>Events</div>
    <PreviewEvents step1State={step1State} setActiveStep={setActiveStep} />

    <PreviewText title="Betting Deadline (UTC)" value={format(step1State.closingTime, DATE_FORMAT)} setActiveStep={setActiveStep} step={0} />

    <PreviewText title="Bet price" value={`${step2State.price} xDAI`} setActiveStep={setActiveStep} step={1} />

    <PreviewText title="Manager" value={step2State.manager} setActiveStep={setActiveStep} step={1} />

    <PreviewText title="Management Fee" value={`${step2State.managementFee}%`} setActiveStep={setActiveStep} step={1} />

    <PreviewText title="Prizes" value={step2State.prizeWeights.map((p, i) => `#${i+1}: ${p.value}%`).join('<br />')} setActiveStep={setActiveStep} step={1} />

    <div style={{textAlign: 'center', width: '100%', marginTop: '20px'}}>
      <div><Button onClick={onSubmit}>Create Market</Button></div>
      <div><Button variant="text" onClick={()=> setActiveStep(1)}>Go to step 2</Button></div>
    </div>
  </div>
}

function MarketsCreate() {
  const { account, error: walletError } = useEthers();
  const [activeStep, setActiveStep] = useState(0);

  const [step1State, setStep1State] = useState<MarketFormStep1Values | undefined>();
  const [step2State, setStep2State] = useState<MarketFormStep2Values | undefined>();

  const defaultClosingTime = dateAdd(today, {days: 5});
  const useForm1Return = useForm<MarketFormStep1Values>({
    mode: 'all',
    defaultValues: {
      market: '',
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
    }
  });

  const {state, createMarket} = useMarketForm();

  const onSubmit1 = (data: MarketFormStep1Values) => {
    setStep1State(data)
    setActiveStep(1)
  }

  const onSubmit2 = (data: MarketFormStep2Values) => {
    setStep2State(data)
    setActiveStep(2)
  }

  const onSubmit3 = async () => {
    if (step1State && step2State) {
      await createMarket(step1State, step2State);
    }
  }

  useEffect(() => {
    if (state.status === 'Success') {
      setActiveStep(3)
    }
  }, [state]);

  if (!account || walletError) {
    return <Alert severity="error">{walletError?.message || 'Connect your wallet to create a market.'}</Alert>
  }

  return <>
    {activeStep < 3 && <div style={{marginBottom: 20}}>
      <Stepper activeStep={activeStep} alternativeLabel>
        <Step><StepLabel>Market</StepLabel></Step>
        <Step><StepLabel>Price</StepLabel></Step>
        <Step><StepLabel>Publish</StepLabel></Step>
      </Stepper>
    </div>}

    {state.errorMessage && <Alert severity="error" sx={{mb: 2}}>{state.errorMessage}</Alert>}

    {activeStep === 0 && <Step1Form onSubmit={onSubmit1} useFormReturn={useForm1Return} />}

    {activeStep === 1 && <Step2Form onSubmit={onSubmit2} useFormReturn={useForm2Return} setActiveStep={setActiveStep}/>}

    {activeStep === 2 && <Step3Form onSubmit={onSubmit3} setActiveStep={setActiveStep} step1State={step1State!} step2State={step2State!} />}

    {activeStep === 3 && <div>[SUCCESS]</div>}
  </>
}

export default MarketsCreate;
