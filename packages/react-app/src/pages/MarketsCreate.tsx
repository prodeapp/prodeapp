import React, {useEffect, useState} from "react";
import {FormError, FormRow, FormLabel, BigAlert} from "../components"
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
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
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import {UseFormReturn} from "react-hook-form/dist/types";
import format from 'date-fns/format'
import {Link as RouterLink, useSearchParams} from "react-router-dom";
import {
  getFlattenedCategories,
  getCategoryText,
  getMarketUrl,
  getTwitterShareUrl,
  localTimeToUtc
} from "../lib/helpers";
import { Trans } from '@lingui/react'
import { i18n } from "@lingui/core"
import {MenuItem, Typography} from "@mui/material";
import {styled, useTheme} from "@mui/material/styles";
import {ReactComponent as TriangleIcon} from "../assets/icons/triangle-right.svg";
import {ReactComponent as ShieldCheckIcon} from "../assets/icons/shield-check.svg";
import {ReactComponent as TwitterIcon} from "../assets/icons/twitter-2.svg";
import {FieldValues} from "react-hook-form/dist/types/fields";
import {getAccount} from "@wagmi/core";
import {useNetwork} from "wagmi";

export const formatAnswers = (answers: string[]) => {
  return answers.map(a => ({value: a}))
}

export const DATE_FORMAT = 'yyyy-MM-dd hh:mm aaa'

const today = new Date();

const wrapperStyle = {width: '100%', maxWidth: '675px'};

interface FormStepProps<T extends FieldValues> {
  useFormReturn: UseFormReturn<T>
  setActiveStep: (step: number) => void
}

interface PreviewStepProps {
  onSubmit: () => void
  step1State: MarketFormStep1Values
  step2State: MarketFormStep2Values
  setActiveStep: (step: number) => void
}

interface SuccessStepProps {
  marketName: string
  marketId: string
  step1State: MarketFormStep1Values
  step2State: MarketFormStep2Values
}

function Step1Form({useFormReturn, setActiveStep}: FormStepProps<MarketFormStep1Values>) {
  const { register, control, formState: { errors, isValid }, handleSubmit } = useFormReturn;

  const { fields: eventsFields, append: appendEvent, remove: removeEvent } = useFieldArray({control, name: 'events'});

  const category = useWatch({ control, name: `category` });

  const addEvent = () => {
    return appendEvent({
      questionPlaceholder: '',
      openingTs: null,
      answers: formatAnswers(['', ''])
    })
  }

  const onSubmit = () => setActiveStep(1)

  return <FormProvider {...useFormReturn}>
    <form onSubmit={handleSubmit(onSubmit)} style={wrapperStyle}>
      <div>
        <FormRow>
          <FormLabel><Trans id="Market Name" /></FormLabel>
          <div>
            <TextField {...register('market', {
              required: i18n._("This field is required.")
            })} error={!!errors.market} style={{width: '100%'}}/>
            <FormError><ErrorMessage errors={errors} name="market" /></FormError>
          </div>
        </FormRow>
        <FormRow>
          <FormLabel><Trans id="Category" /></FormLabel>
          <div>
            <TextField
              select
              value={category}
              {...register('category', {
                required: i18n._("This field is required.")
              })}
              error={!!errors.category}
              style={{width: '100%'}}>
              {getFlattenedCategories().map(cat => <MenuItem value={cat.id} key={cat.id}>{cat.isChild ? `-- ${cat.text}` : cat.text}</MenuItem>)}
            </TextField>
            <FormError><ErrorMessage errors={errors} name="category" /></FormError>
          </div>
        </FormRow>
        <FormRow>
          <FormLabel><Trans id="Betting Deadline (UTC)" /></FormLabel>
          <div>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Controller
                control={control}
                name='closingTime'
                rules={{required: i18n._("This field is required")}}
                render={({ field }) => (
                  <DateTimePicker
                    minDate={today}
                    onChange={field.onChange}
                    value={field.value}
                    inputFormat={DATE_FORMAT}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                )}
              />
            </LocalizationProvider>
            <FormHelperText><Trans id="Bets will not be accepted passed this time. It should be before the beginning of the first event." /></FormHelperText>
            <FormError><ErrorMessage errors={errors} name="closingTime" /></FormError>
          </div>
        </FormRow>
        <FormRow>
          <FormLabel><Trans id="Events" /></FormLabel>
        </FormRow>
        <FormRow>
          <Alert severity="info" sx={{width: '100%'}}><Trans id="A market must have at least three events." /></Alert>
        </FormRow>
        {eventsFields.length > 0 &&
        <FormRow style={{flexDirection: 'column'}}>
          {eventsFields.map((questionField, i) => {
            return (
              <div key={questionField.id} style={{minWidth: '100%'}}>
                <EventBuilder
                  eventIndex={i}
                  {...{removeEvent}}
                />
              </div>
            )
          })}
        </FormRow>
        }
        <FormRow>
          <Button onClick={addEvent} variant="outlined" fullWidth><Trans id="Add event" /> +</Button>
        </FormRow>
      </div>

      {isValid && eventsFields.length >= 3 && <div style={{marginBottom: '20px'}}>
        <Button type="submit" fullWidth size="large"><Trans id="Next" /> &gt;</Button>
      </div>}
    </form>
  </FormProvider>
}

function Step2Form({useFormReturn, setActiveStep}: FormStepProps<MarketFormStep2Values>) {
  const { register, formState: {errors, isValid}, handleSubmit } = useFormReturn;

  useEffect(() => {
    useFormReturn.register('prizeDivisor', {
      validate: value => value === 100 || i18n._("The sum of prize weights must be 100.")
    });
  }, [useFormReturn]);

  const onSubmit = () => setActiveStep(2)

  return <FormProvider {...useFormReturn}>
    <form onSubmit={handleSubmit(onSubmit)} style={wrapperStyle}>
      <div>
        <FormRow>
          <FormLabel><Trans id="Bet Price (xDAI)" /></FormLabel>
          <div>
            <TextField {...register('price', {
              required: i18n._("This field is required."),
              valueAsNumber: true,
              validate: v => !isNaN(Number(v)) || i18n._("Invalid number."),
              min: { value: 0.01, message: i18n._("Price must be greater than 0.01") }
            })} error={!!errors.price} style={{width: '100%'}} />
            <FormError><ErrorMessage errors={errors} name="price" /></FormError>
          </div>
        </FormRow>
        <FormRow>
          <FormLabel><Trans id="Manager" /></FormLabel>
          <div>
            <TextField {...register('manager', {
              required: i18n._("This field is required."),
              validate: v => isAddress(v) || 'Invalid address.',
            })} error={!!errors.manager} style={{width: '100%'}} />
            <FormHelperText><Trans id="Address to send management fees to." /></FormHelperText>
            <FormError><ErrorMessage errors={errors} name="manager" /></FormError>
          </div>
        </FormRow>
        <FormRow>
          <FormLabel><Trans id="Management Fee" /> (%)</FormLabel>
          <div>
            <TextField {...register('managementFee', {
              required: i18n._("This field is required."),
              valueAsNumber: true,
              validate: v => !isNaN(Number(v)) || 'Invalid number.',
              min: {value: 0, message: i18n._("Fee must be greater than 0.")},
              max: {value: 100, message: i18n._("Fee must be lower than 100.")}
            })} error={!!errors.managementFee} style={{width: '100%'}} />
            <FormHelperText><Trans id="The manager will receive this percentage of the pool as reward. In addition, the market creator will be rewarded when bets are traded on NFT marketplaces." /></FormHelperText>
            <FormError><ErrorMessage errors={errors} name="managementFee" /></FormError>
          </div>
        </FormRow>
        <FormRow>
          <FormLabel><Trans id="Prize Distribution (%)" /></FormLabel>
          <PrizeWeightsBuilder />
        </FormRow>

        <FormRow style={{marginBottom: '20px'}}>
          {isValid && <Button type="submit" fullWidth size="large" sx={{mb: 2}}><Trans id="Next" /> &gt;</Button>}
          <Button variant="outlined" onClick={()=> setActiveStep(0)} fullWidth size="large">&lt; <Trans id="Previous" /></Button>
        </FormRow>
      </div>
    </form>
  </FormProvider>
}

function PreviewText({title, value, component, setActiveStep, step}: {title?: string|undefined, value?: string|number|undefined, component?: React.ReactNode|undefined, setActiveStep: (step: number) => void, step: number}) {
  const theme = useTheme();

  return <div style={{display: 'flex', justifyItems: 'space-between', marginBottom: '20px'}}>
    <div style={wrapperStyle}>
      {title !== undefined && <FormLabel style={{opacity: '0.85'}}>{title}</FormLabel>}
      {value !== undefined && <TextField
        fullWidth
        value={String(value)}
        InputProps={{
          readOnly: true,
        }}
      />}
      {component !== undefined && component}
    </div>
    <div style={{display: 'flex', alignItems: 'end'}}>
      <Button variant="text" size="large" onClick={()=> setActiveStep(step)}><Trans id="Edit" /> <TriangleIcon style={{marginLeft: '10px', fill: 'currentColor', color: theme.palette.primary.main}}/></Button>
    </div>
  </div>
}

function PreviewEvents({step1State, setActiveStep}: {step1State: MarketFormStep1Values, setActiveStep: (step: number) => void}) {
  return <div>
    {step1State.events.map((event, i) => {
      const eventData = getEventData(event.questionPlaceholder, event.answers, step1State.market);
      return <PreviewText key={i} title={eventData.question} value={`${i18n._("Opening Time")}: ${format(event.openingTs!, DATE_FORMAT)}, ${i18n._("Answers")}: ${eventData.answers.join(', ')}`} setActiveStep={setActiveStep} step={0} />
    })}
  </div>
}

function PreviewStep({onSubmit, step1State, step2State, setActiveStep}: PreviewStepProps) {
  const prizes = [i18n._("First prize"), i18n._("Second prize"), i18n._("Third prize")];

  return <div>

    <h2><Trans id="Review and publish your market" /></h2>

    <PreviewText title={i18n._("Market Name")} value={step1State.market} setActiveStep={setActiveStep} step={0} />

    <PreviewText title={i18n._("Category")} value={getCategoryText(step1State.category)} setActiveStep={setActiveStep} step={0} />

    <div style={{fontWeight: 'bold', margin: '35px 0', fontSize: '14px', borderBottom: '1px solid #303030', paddingBottom: '5px', ...wrapperStyle}}>
      <Trans id="Events" />
    </div>
    <PreviewEvents step1State={step1State} setActiveStep={setActiveStep} />

    <PreviewText title={i18n._("Betting Deadline (UTC)")} value={format(step1State.closingTime, DATE_FORMAT)} setActiveStep={setActiveStep} step={0} />

    <PreviewText title={i18n._("Bet Price")} value={`${step2State.price} xDAI`} setActiveStep={setActiveStep} step={1} />

    <PreviewText title={i18n._("Manager")} value={step2State.manager} setActiveStep={setActiveStep} step={1} />

    <PreviewText title={i18n._("Management Fee")} value={`${step2State.managementFee}%`} setActiveStep={setActiveStep} step={1} />

    <PreviewText
      component={
        <Grid container spacing={2}>
          {step2State.prizeWeights.map((p, i) => {
            return <Grid item xs={6} md={4} key={i}>
              <div>
                <FormLabel>{prizes[i] || `Prize #${i+1}`}</FormLabel>
                <TextField
                  fullWidth
                  value={p.value}
                  InputProps={{
                    readOnly: true
                  }}
                />
              </div>
            </Grid>
          })}
        </Grid>
      }
      setActiveStep={setActiveStep}
      step={1}
    />

    <div style={{marginBottom: '20px', ...wrapperStyle}}>
      <Button onClick={onSubmit} color="primary" fullWidth size="large" sx={{mb: 2}}><Trans id="Create Market" /> &gt;</Button>
      <Button variant="outlined" onClick={()=> setActiveStep(1)} fullWidth size="large">&lt; <Trans id="Previous" /></Button>
    </div>
  </div>
}

function SuccessStep({marketName, marketId, step1State, step2State}: SuccessStepProps) {
  const shareUrl = getTwitterShareUrl(i18n._(`I have created a new market on @prode_eth: {0} {1}`, {0: marketName, 1: getMarketUrl(marketId)}))

  const boxSx = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    padding: 4,
    border: '1px solid #303030',
  };

  return <Box sx={{maxWidth: '918px', mx: 'auto', my: {xs: 4, md: 8}}}>

    <BigAlert severity="success" icon={<ShieldCheckIcon width="24" height="26" />}>
      <Box sx={{display: {md: 'flex'}, justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <div><AlertTitle><Trans id="Congratulations!" /></AlertTitle></div>
          <div><Trans id="The market was successfully created and is ready to take bets." /></div>
        </div>
        <Box sx={{mt: {xs: 2, md: 0}, minWidth: '230px', textAlign: 'right'}}>
          <Button component={Link} size="large" href={shareUrl} target="_blank" rel="noopener" sx={{background: '#00ACEE'}}>
            Share on Twitter <TwitterIcon style={{marginLeft: '10px'}} />
          </Button>
        </Box>
      </Box>
    </BigAlert>

    <Grid container spacing={2} sx={{mt: 4}}>
      <Grid item xs={12} md={6}>
        <Box sx={boxSx}>
          <Typography variant="h4s" sx={{textAlign: 'center'}}><Trans id="Verify your market" /></Typography>
          <div style={{margin: '15px 0'}}><Trans id="By verifying your market future bettors will know that:" /></div>

          <ul style={{padding: 0, listStylePosition: 'inside'}}>
            <li><Trans id="The events are of public knowledge." /></li>
            <li><Trans id="Your questions are well formulated." /></li>
            <li><Trans id="The closing time is before the start of the first event." /></li>
            <li><Trans id="The market was correctly created and has no errors." /></li>
          </ul>

          <div><Button component={RouterLink} to={`/curate/submit/${marketId}`} fullWidth><Trans id="Verify market" /></Button>
          </div>
        </Box>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box sx={boxSx}>
          <Typography variant="h4s" sx={{textAlign: 'center'}}><Trans id="Your market" /></Typography>

          <ul style={{padding: 0, listStylePosition: 'inside'}}>
            <li><Trans id="Bets can be placed until {0}" values={{0: format(step1State.closingTime, DATE_FORMAT)}}/></li>
            <li><Trans id="You will receive {0} of the prize pool as fee." values={{0: `${step2State.managementFee}%`}}/></li>
            <li><Trans id="Share this tournament on your social networks to reach the highest number of interested users." /></li>
          </ul>

          <div>
            <Button component={RouterLink} to={`/markets/${marketId}?new=1`} variant="outlined" fullWidth><Trans id="Go to the market" /></Button>
          </div>
        </Box>
      </Grid>
    </Grid>
  </Box>
}

export const Banner = styled('div')(({ theme }) => ({
  height: '368px',
  padding: '50px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}));

function BigStepper({steps, activeStep}: {steps: string[], activeStep: number}) {
  const cssTriangle = (size: number, color: string) => {
    return {
      content: "''",
      width: 0,
      height: 0,
      borderStyle: 'solid',
      borderWidth: `${size}px ${size}px 0 ${size}px`,
      borderColor: `${color} transparent transparent transparent`,
    }
  }
  const StepperWrapper = styled(Grid)(({ theme }) => ({
    '& > div': {
      border: '1px solid #303030',
      '&.current-step': {
        position: 'relative',
        '&:before': {
          ...cssTriangle(23, theme.palette.black.dark),
          position: 'absolute',
          bottom: '-23px',
        },
        '&:after': {
          ...cssTriangle(23, theme.palette.secondary.light),
          position: 'absolute',
          bottom: '-22px',
        },
      },
      '&.previous-step': {
        color: theme.palette.black.light,
        background: theme.palette.secondary.dark,
      },
      '&.next-step': {
        background: theme.palette.secondary.main,
      }
    }
  }));

  return <StepperWrapper container>
    {steps.map((label, i) => {
      return <Grid item key={i} xs={4} sx={{px: {xs: 2, md: 3}, py: {xs: 2, md: 6}, mb: 4}}
                   className={`${i === activeStep ? 'current-step' : (i < activeStep ? 'previous-step' : 'next-step')}`}>
        <Typography variant="p3"><Trans id="Step {0}" values={{0: i+1}} /></Typography>
        <Typography variant="h5">{label}</Typography>
      </Grid>
    })}
  </StepperWrapper>
}

function MarketsCreate() {
  const {address} = getAccount();
  const { chain } = useNetwork()
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
      managementFee: 3
    }
  });

  const step1State = useForm1Return.getValues();
  const step2State = useForm2Return.getValues();

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const importData = searchParams.get('import');

    if (importData !== null) {
      try {
        const data = JSON.parse(importData);

        if (data.title) {
          useForm1Return.setValue('market', data.title);
        }

        if (data.closingTime) {
          useForm1Return.setValue('closingTime', localTimeToUtc(data.closingTime));
        }

        if (data.category) {
          useForm1Return.setValue('category', data.category);
        }

        if (data.events) {
          useForm1Return.setValue(
            'events',
            data.events.map((e: any) => ({
              questionPlaceholder: e.question,
              openingTs: localTimeToUtc(e.openingTs),
              answers: e.answers.map((a: any) => ({value: a}))
            }))
          );
        }

        if (data.price) {
          useForm2Return.setValue(
            'price',
            data.price
          );
        }

        if (data.manager) {
          useForm2Return.setValue(
            'manager',
            data.manager
          );
        }

        if (data.managementFee) {
          useForm2Return.setValue(
            'managementFee',
            data.managementFee
          );
        }

        if (data.prizeWeights) {
          useForm2Return.setValue(
            'prizeWeights',
            data.prizeWeights.map((p: any) => ({value: Number(p)}))
          );
        }

      } catch (e) {
        console.error('Failed market import', e);
      }
    }
  }, [searchParams, useForm1Return, useForm2Return]);

  const {isSuccess, error, createMarket, marketId} = useMarketForm();

  const onSubmit = async () => {
    if (step1State && step2State) {
      await createMarket(step1State, step2State);
    }
  }

  useEffect(() => {
    if (isSuccess) {
      setActiveStep(3)
    }
  }, [isSuccess]);

  useEffect(() => {
    if (step2State.manager === '' && address) {
      useForm2Return.setValue('manager', address || '');
    }
  // eslint-disable-next-line
  }, [address]);

  if (!address) {
    return <Alert severity="error"><Trans id="Connect your wallet to create a market." /></Alert>
  }

  if (!chain || chain.unsupported) {
    return <Alert severity="error"><Trans id="UNSUPPORTED_CHAIN" /></Alert>
  }

  return <div>

    {activeStep < 3 && <Banner style={{backgroundImage: 'url(/banners/banner-3.jpg)'}}>
      <Typography variant="h1s"><Trans id="Create a new market<br />in 3 simple steps" /></Typography>
    </Banner>}

    {activeStep < 3 && <div style={{marginBottom: 50}}>
      <BigStepper steps={[i18n._("Market detail"), i18n._("Price"), i18n._("Publish")]} activeStep={activeStep} />
    </div>}

    <Container>

      {error && <Alert severity="error" sx={{mb: 2}}>{error.message}</Alert>}

      {activeStep === 0 && <Step1Form useFormReturn={useForm1Return} setActiveStep={setActiveStep} />}

      {activeStep === 1 && <Step2Form useFormReturn={useForm2Return} setActiveStep={setActiveStep} />}

      {activeStep === 2 && <PreviewStep onSubmit={onSubmit} setActiveStep={setActiveStep} step1State={step1State} step2State={step2State} />}

      {activeStep === 3 && <SuccessStep marketName={step1State.market} marketId={marketId} step1State={step1State} step2State={step2State} />}

    </Container>
  </div>
}

export default MarketsCreate;
