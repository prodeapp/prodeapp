import { isAddress } from '@ethersproject/address'
import { parseUnits } from '@ethersproject/units'
import { ErrorMessage } from '@hookform/error-message'
import { t } from '@lingui/macro'
import { Trans } from '@lingui/macro'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Container from '@mui/material/Container'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import MenuItem from '@mui/material/MenuItem'
import { styled, useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dateAdd from 'date-fns/add'
import format from 'date-fns/format'
import React, { useEffect, useState } from 'react'
import { Controller, FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { UseFormReturn } from 'react-hook-form/dist/types'
import { FieldValues } from 'react-hook-form/dist/types/fields'
import { Link as RouterLink, useSearchParams } from 'react-router-dom'
import { useAccount, useNetwork } from 'wagmi'

import { ReactComponent as ShieldCheckIcon } from '@/assets/icons/shield-check.svg'
import { ReactComponent as TriangleIcon } from '@/assets/icons/triangle-right.svg'
import { ReactComponent as TwitterIcon } from '@/assets/icons/twitter-2.svg'
import { BigAlert, FormError, FormLabel, FormRow } from '@/components'
import EventBuilder from '@/components/MarketCreate/EventBuilder'
import PrizeWeightsBuilder from '@/components/MarketCreate/PrizeWeightsBuilder'
import useMarketForm, { getEventData, MarketFormStep1Values, MarketFormStep2Values } from '@/hooks/useMarketForm'
import { filterChainId, getConfigString, isMainChain } from '@/lib/config'
import {
	formatAmount,
	getCategoryText,
	getFlattenedCategories,
	getMarketUrl,
	getTwitterShareUrl,
	localTimeToUtc,
} from '@/lib/helpers'
import { paths } from '@/lib/paths'

export const formatAnswers = (answers: string[]) => {
	return answers.map((a) => ({ value: a }))
}

export const DATE_FORMAT = 'yyyy-MM-dd hh:mm aaa'

const today = new Date()

const wrapperStyle = { width: '100%', maxWidth: '675px' }

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

function Step1Form({ useFormReturn, setActiveStep }: FormStepProps<MarketFormStep1Values>) {
	const {
		register,
		control,
		formState: { errors, isValid },
		handleSubmit,
	} = useFormReturn

	const { fields: eventsFields, append: appendEvent, remove: removeEvent } = useFieldArray({ control, name: 'events' })

	const category = useWatch({ control, name: `category` })

	const addEvent = () => {
		return appendEvent({
			questionPlaceholder: '',
			openingTs: null,
			answers: formatAnswers(['', '']),
		})
	}

	const onSubmit = () => setActiveStep(1)

	return (
		<FormProvider {...useFormReturn}>
			<form onSubmit={handleSubmit(onSubmit)} style={wrapperStyle}>
				<div>
					<FormRow>
						<FormLabel>
							<Trans>Market Name</Trans>
						</FormLabel>
						<div>
							<TextField
								{...register('market', {
									required: t`This field is required.`,
								})}
								error={!!errors.market}
								style={{ width: '100%' }}
							/>
							<FormError>
								<ErrorMessage errors={errors} name='market' />
							</FormError>
						</div>
					</FormRow>
					<FormRow>
						<FormLabel>
							<Trans>Category</Trans>
						</FormLabel>
						<div>
							<TextField
								select
								value={category}
								{...register('category', {
									required: t`This field is required.`,
								})}
								error={!!errors.category}
								style={{ width: '100%' }}
							>
								{getFlattenedCategories().map((cat) => (
									<MenuItem value={cat.id} key={cat.id}>
										{cat.isChild ? `-- ${cat.text}` : cat.text}
									</MenuItem>
								))}
							</TextField>
							<FormError>
								<ErrorMessage errors={errors} name='category' />
							</FormError>
						</div>
					</FormRow>
					<FormRow>
						<FormLabel>
							<Trans>Betting Deadline (UTC)</Trans>
						</FormLabel>
						<div>
							<LocalizationProvider dateAdapter={AdapterDateFns}>
								<Controller
									control={control}
									name='closingTime'
									rules={{ required: t`This field is required` }}
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
							<FormHelperText>
								<Trans>
									Bets will not be accepted passed this time. It should be before the beginning of the first event.
								</Trans>
							</FormHelperText>
							<FormError>
								<ErrorMessage errors={errors} name='closingTime' />
							</FormError>
						</div>
					</FormRow>
					<FormRow>
						<FormLabel>
							<Trans>Events</Trans>
						</FormLabel>
					</FormRow>
					<FormRow>
						<Alert severity='info' sx={{ width: '100%' }}>
							<Trans>A market must have at least three events.</Trans>
						</Alert>
					</FormRow>
					{eventsFields.length > 0 && (
						<FormRow style={{ flexDirection: 'column' }}>
							{eventsFields.map((questionField, i) => {
								return (
									<div key={questionField.id} style={{ minWidth: '100%' }}>
										<EventBuilder eventIndex={i} {...{ removeEvent }} />
									</div>
								)
							})}
						</FormRow>
					)}
					<FormRow>
						<Button onClick={addEvent} variant='outlined' fullWidth>
							<Trans>Add event</Trans> +
						</Button>
					</FormRow>
				</div>

				{isValid && eventsFields.length >= 3 && (
					<div style={{ marginBottom: '20px' }}>
						<Button type='submit' fullWidth size='large'>
							<Trans>Next</Trans> &gt;
						</Button>
					</div>
				)}
			</form>
		</FormProvider>
	)
}

function Step2Form({
	useFormReturn,
	setActiveStep,
}: /*maxPointsToWin,*/
FormStepProps<MarketFormStep2Values> & { maxPointsToWin: number }) {
	const {
		control,
		register,
		formState: { errors, isValid },
		handleSubmit,
	} = useFormReturn

	const { chain } = useNetwork()
	const chainId = filterChainId(chain?.id)

	useEffect(() => {
		useFormReturn.register('prizeDivisor', {
			validate: (value) => value === 100 || t`The sum of prize weights must be 100.`,
		})
	}, [useFormReturn])

	const addLP = useWatch({ control, name: `addLP` })

	const onSubmit = () => setActiveStep(2)

	return (
		<FormProvider {...useFormReturn}>
			<form onSubmit={handleSubmit(onSubmit)} style={wrapperStyle}>
				<div>
					<FormRow>
						<FormLabel>
							<Trans>Bet Price ({getConfigString('NETWORK_TOKEN', chainId)})</Trans>
						</FormLabel>
						<div>
							<TextField
								{...register('price', {
									required: t`This field is required.`,
									valueAsNumber: true,
									validate: (v) => !isNaN(Number(v)) || t`Invalid number.`,
									min: {
										value: 0.01,
										message: t`Price must be greater than 0.01`,
									},
								})}
								error={!!errors.price}
								style={{ width: '100%' }}
							/>
							<FormError>
								<ErrorMessage errors={errors} name='price' />
							</FormError>
						</div>
					</FormRow>
					<FormRow>
						<FormLabel>
							<Trans>Prize Distribution (%)</Trans>
						</FormLabel>
						<PrizeWeightsBuilder />
					</FormRow>
					<FormRow>
						<FormLabel>
							<Trans>Manager</Trans>
						</FormLabel>
						<div>
							<TextField
								{...register('manager', {
									required: t`This field is required.`,
									validate: (v) => isAddress(v) || 'Invalid address.',
								})}
								error={!!errors.manager}
								style={{ width: '100%' }}
							/>
							<FormHelperText>
								<Trans>Address to send management fees to.</Trans>
							</FormHelperText>
							<FormError>
								<ErrorMessage errors={errors} name='manager' />
							</FormError>
						</div>
					</FormRow>
					<FormRow>
						<FormControlLabel
							control={<Checkbox {...register('addLP')} checked={addLP} />}
							label='Add liquidity pool'
						/>
					</FormRow>
					<FormRow>
						<FormLabel>
							{!addLP && (
								<>
									<Trans>Management Fee</Trans> (%)
								</>
							)}
							{addLP && (
								<>
									<Trans>LP Rewards</Trans> (%)
								</>
							)}
						</FormLabel>
						<div>
							<TextField
								{...register('managementFee', {
									required: t`This field is required.`,
									valueAsNumber: true,
									validate: (v) => !isNaN(Number(v)) || 'Invalid number.',
									min: {
										value: 0,
										message: t`Fee must be greater than 0.`,
									},
									max: {
										value: 100,
										message: t`Fee must be lower than 100.`,
									},
								})}
								error={!!errors.managementFee}
								style={{ width: '100%' }}
							/>
							<FormHelperText>
								{!addLP && (
									<Trans>
										The manager will receive this percentage of the pool as reward. In addition, the market creator will
										be rewarded when bets are traded on NFT marketplaces.
									</Trans>
								)}
								{addLP && <Trans>Percentage of the pool paid to Liquidity Providers.</Trans>}
							</FormHelperText>
							<FormError>
								<ErrorMessage errors={errors} name='managementFee' />
							</FormError>
						</div>
					</FormRow>
					{addLP && (
						<>
							<FormRow>
								<FormLabel>
									<Trans>Creator Fee</Trans> (%)
								</FormLabel>
								<div>
									<TextField
										{...register('lpCreatorFee', {
											required: t`This field is required.`,
											valueAsNumber: true,
											validate: (v) => !isNaN(Number(v)) || 'Invalid number.',
											min: {
												value: 0,
												message: t`Fee must be greater than 0.`,
											},
											max: {
												value: 100,
												message: t`Fee must be lower than 100.`,
											},
										})}
										error={!!errors.lpCreatorFee}
										style={{ width: '100%' }}
									/>
									<FormHelperText>
										<Trans>% of the LP Rewards that goes to the creator of the market.</Trans>
									</FormHelperText>
									<FormError>
										<ErrorMessage errors={errors} name='lpCreatorFee' />
									</FormError>
								</div>
							</FormRow>
							{/*
							<FormRow>
								<FormLabel>
									<Trans>Bet Multiplier</Trans>
								</FormLabel>
								<div>
									<TextField
										{...register('lpBetMultiplier', {
											required: t`This field is required.`,
											valueAsNumber: true,
											validate: v => !isNaN(Number(v)) || t`Invalid number.`,
											min: {
												value: 1,
												message: t`Bet multiplier must be greater than 1`,
											},
										})}
										error={!!errors.lpBetMultiplier}
										style={{ width: '100%' }}
									/>
									<FormHelperText>
										<Trans>How much the LP adds to the market pool for each $ added to the market</Trans>
									</FormHelperText>
									<FormError>
										<ErrorMessage errors={errors} name='lpBetMultiplier' />
									</FormError>
								</div>
							</FormRow>

							<FormRow>
								<FormLabel>
									<Trans>Points to Win</Trans>
								</FormLabel>
								<div>
									<TextField
										{...register('lpPointsToWin', {
											required: t`This field is required.`,
											valueAsNumber: true,
											validate: v => !isNaN(Number(v)) || t`Invalid number.`,
											min: {
												value: 1,
												message: t`Points to Win must be greater than 1`,
											},
											max: {
												value: maxPointsToWin,
												message: t`Points to Win must be lower or equal than the amount of events`,
											},
										})}
										error={!!errors.lpPointsToWin}
										style={{ width: '100%' }}
									/>
									<FormHelperText>
										<Trans>Points needed to win the liquidity pool prize</Trans>
									</FormHelperText>
									<FormError>
										<ErrorMessage errors={errors} name='lpPointsToWin' />
									</FormError>
								</div>
							</FormRow>
							*/}
						</>
					)}

					<FormRow style={{ marginBottom: '20px' }}>
						{isValid && (
							<Button type='submit' fullWidth size='large' sx={{ mb: 2 }}>
								<Trans>Next</Trans> &gt;
							</Button>
						)}
						<Button variant='outlined' onClick={() => setActiveStep(0)} fullWidth size='large'>
							&lt; <Trans>Previous</Trans>
						</Button>
					</FormRow>
				</div>
			</form>
		</FormProvider>
	)
}

function PreviewText({
	title,
	value,
	component,
	setActiveStep,
	step,
}: {
	title?: string | undefined
	value?: string | number | undefined
	component?: React.ReactNode | undefined
	setActiveStep: (step: number) => void
	step: number
}) {
	const theme = useTheme()

	return (
		<div
			style={{
				display: 'flex',
				justifyItems: 'space-between',
				marginBottom: '20px',
			}}
		>
			<div style={wrapperStyle}>
				{title !== undefined && <FormLabel style={{ opacity: '0.85' }}>{title}</FormLabel>}
				{value !== undefined && (
					<TextField
						fullWidth
						value={String(value)}
						InputProps={{
							readOnly: true,
						}}
					/>
				)}
				{component !== undefined && component}
			</div>
			<div style={{ display: 'flex', alignItems: 'end' }}>
				<Button variant='text' size='large' onClick={() => setActiveStep(step)}>
					<Trans>Edit</Trans>{' '}
					<TriangleIcon
						style={{
							marginLeft: '10px',
							fill: 'currentColor',
							color: theme.palette.primary.main,
						}}
					/>
				</Button>
			</div>
		</div>
	)
}

function PreviewEvents({
	step1State,
	setActiveStep,
}: {
	step1State: MarketFormStep1Values
	setActiveStep: (step: number) => void
}) {
	return (
		<div>
			{step1State.events.map((event, i) => {
				const eventData = getEventData(event.questionPlaceholder, event.answers, step1State.market)
				return (
					<PreviewText
						key={i}
						title={eventData.question}
						value={`${t`Opening Time`}: ${format(
							event.openingTs!,
							DATE_FORMAT
						)}, ${t`Answers`}: ${eventData.answers.join(', ')}`}
						setActiveStep={setActiveStep}
						step={0}
					/>
				)
			})}
		</div>
	)
}

function PreviewStep({
	onSubmit,
	step1State,
	step2State,
	setActiveStep,
	isPrepared,
}: PreviewStepProps & { isPrepared: boolean }) {
	const { chain } = useNetwork()
	const chainId = filterChainId(chain?.id)

	const prizes = [t`First prize`, t`Second prize`, t`Third prize`]

	return (
		<div>
			<h2>
				<Trans>Review and publish your market</Trans>
			</h2>

			<PreviewText
				title={t`Market Name`}
				value={step1State.market}
				setActiveStep={setActiveStep}
				step={FormSteps.STEP_1}
			/>

			<PreviewText
				title={t`Category`}
				value={getCategoryText(step1State.category)}
				setActiveStep={setActiveStep}
				step={FormSteps.STEP_1}
			/>

			<div
				style={{
					fontWeight: 'bold',
					margin: '35px 0',
					fontSize: '14px',
					borderBottom: '1px solid #303030',
					paddingBottom: '5px',
					...wrapperStyle,
				}}
			>
				<Trans>Events</Trans>
			</div>
			<PreviewEvents step1State={step1State} setActiveStep={setActiveStep} />

			<PreviewText
				title={t`Betting Deadline (UTC)`}
				value={format(step1State.closingTime, DATE_FORMAT)}
				setActiveStep={setActiveStep}
				step={FormSteps.STEP_1}
			/>

			<PreviewText
				title={t`Bet Price`}
				value={formatAmount(parseUnits(String(step2State.price), 18), chainId)}
				setActiveStep={setActiveStep}
				step={FormSteps.STEP_2}
			/>

			<PreviewText
				component={
					<Grid container spacing={2}>
						{step2State.prizeWeights.map((p, i) => {
							return (
								<Grid item xs={6} md={4} key={i}>
									<div>
										<FormLabel>{prizes[i] || `Prize #${i + 1}`}</FormLabel>
										<TextField
											fullWidth
											value={p.value}
											InputProps={{
												readOnly: true,
											}}
										/>
									</div>
								</Grid>
							)
						})}
					</Grid>
				}
				setActiveStep={setActiveStep}
				step={FormSteps.STEP_2}
			/>

			<PreviewText
				title={t`Manager`}
				value={step2State.manager}
				setActiveStep={setActiveStep}
				step={FormSteps.STEP_2}
			/>

			<PreviewText
				title={!step2State.addLP ? t`Management Fee` : t`LP Rewards`}
				value={`${step2State.managementFee}%`}
				setActiveStep={setActiveStep}
				step={FormSteps.STEP_2}
			/>

			{step2State.addLP && (
				<>
					<PreviewText
						title={t`Creator Fee`}
						value={`${step2State.lpCreatorFee}%`}
						setActiveStep={setActiveStep}
						step={FormSteps.STEP_2}
					/>
					{/*<PreviewText
						title={t`Bet Multiplier`}
						value={step2State.lpBetMultiplier}
						setActiveStep={setActiveStep}
						step={FormSteps.STEP_2}
					/>
					<PreviewText
						title={t`Points to Win`}
						value={step2State.lpPointsToWin}
						setActiveStep={setActiveStep}
						step={FormSteps.STEP_2}
					/>*/}
				</>
			)}

			<div style={{ marginBottom: '20px', ...wrapperStyle }}>
				{isPrepared && (
					<Button onClick={onSubmit} color='primary' fullWidth size='large' sx={{ mb: 2 }}>
						<Trans>Create Market</Trans> &gt;
					</Button>
				)}
				<Button variant='outlined' onClick={() => setActiveStep(1)} fullWidth size='large'>
					&lt; <Trans>Previous</Trans>
				</Button>
			</div>
		</div>
	)
}

function SuccessStep({ marketName, marketId, step1State, step2State }: SuccessStepProps) {
	const { chain } = useNetwork()
	const chainId = filterChainId(chain?.id)

	const shareUrl = getTwitterShareUrl(
		t`I have created a new market on @prode_eth: ${marketName} ${getMarketUrl(marketId, chainId)}`
	)

	const boxSx = {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'space-between',
		height: '100%',
		padding: 4,
		border: '1px solid #303030',
	}

	return (
		<Box sx={{ maxWidth: '918px', mx: 'auto', my: { xs: 4, md: 8 } }}>
			<BigAlert severity='success' icon={<ShieldCheckIcon width='24' height='26' />}>
				<Box
					sx={{
						display: { md: 'flex' },
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<div>
						<div>
							<AlertTitle>
								<Trans>Congratulations!</Trans>
							</AlertTitle>
						</div>
						<div>
							<Trans>The market was successfully created and is ready to take bets.</Trans>
						</div>
					</div>
					<Box sx={{ mt: { xs: 2, md: 0 }, minWidth: '230px', textAlign: 'right' }}>
						<Button
							component={Link}
							size='large'
							href={shareUrl}
							target='_blank'
							rel='noopener'
							sx={{ background: '#00ACEE' }}
						>
							Share on Twitter <TwitterIcon style={{ marginLeft: '10px' }} />
						</Button>
					</Box>
				</Box>
			</BigAlert>

			<Grid container spacing={2} sx={{ mt: 4 }}>
				<Grid item xs={12} md={6}>
					<Box sx={boxSx}>
						<Typography variant='h4s' sx={{ textAlign: 'center' }}>
							<Trans>Verify your market</Trans>
						</Typography>
						<div style={{ margin: '15px 0' }}>
							<Trans>By verifying your market future bettors will know that:</Trans>
						</div>

						<ul style={{ padding: 0, listStylePosition: 'inside' }}>
							<li>
								<Trans>The events are of public knowledge.</Trans>
							</li>
							<li>
								<Trans>Your questions are well formulated.</Trans>
							</li>
							<li>
								<Trans>The closing time is before the start of the first event.</Trans>
							</li>
							<li>
								<Trans>The market was correctly created and has no errors.</Trans>
							</li>
						</ul>

						<div>
							<Button component={RouterLink} to={`/curate/submit/${marketId}`} fullWidth>
								<Trans>Verify market</Trans>
							</Button>
						</div>
					</Box>
				</Grid>
				<Grid item xs={12} md={6}>
					<Box sx={boxSx}>
						<Typography variant='h4s' sx={{ textAlign: 'center' }}>
							<Trans>Your market</Trans>
						</Typography>

						<ul style={{ padding: 0, listStylePosition: 'inside' }}>
							<li>
								<Trans>Bets can be placed until {format(step1State.closingTime, DATE_FORMAT)}</Trans>
							</li>
							<li>
								<Trans id='You will receive {0}% of the prize pool as fee.' values={{ 0: step2State.managementFee }} />
							</li>
							<li>
								<Trans>
									Share this tournament on your social networks to reach the highest number of interested users.
								</Trans>
							</li>
						</ul>

						<div>
							<Button component={RouterLink} to={paths.market(marketId, chainId)} variant='outlined' fullWidth>
								<Trans>Go to the market</Trans>
							</Button>
						</div>
					</Box>
				</Grid>
			</Grid>
		</Box>
	)
}

export const Banner = styled('div')(() => ({
	height: '368px',
	padding: '50px',
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
	backgroundSize: 'cover',
	backgroundPosition: 'center',
}))

function BigStepper({ steps, activeStep }: { steps: string[]; activeStep: number }) {
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
			},
		},
	}))

	return (
		<StepperWrapper container>
			{steps.map((label, i) => {
				return (
					<Grid
						item
						key={i}
						xs={4}
						sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 6 }, mb: 4 }}
						className={`${i === activeStep ? 'current-step' : i < activeStep ? 'previous-step' : 'next-step'}`}
					>
						<Typography variant='p3'>
							<Trans>Step {i + 1}</Trans>
						</Typography>
						<Typography variant='h5'>{label}</Typography>
					</Grid>
				)
			})}
		</StepperWrapper>
	)
}

enum FormSteps {
	STEP_1,
	STEP_2,
	PREVIEW,
	SUCCESS,
}

function MarketsCreate() {
	const { address } = useAccount()
	const { chain } = useNetwork()
	const [activeStep, setActiveStep] = useState(FormSteps.STEP_1)

	const defaultClosingTime = dateAdd(today, { days: 5 })
	const useForm1Return = useForm<MarketFormStep1Values>({
		mode: 'all',
		defaultValues: {
			market: '',
			category: '',
			closingTime: defaultClosingTime,
			events: [],
		},
	})

	const useForm2Return = useForm<MarketFormStep2Values>({
		mode: 'all',
		defaultValues: {
			prizeWeights: [{ value: 50 }, { value: 30 }, { value: 20 }],
			prizeDivisor: 0,
			manager: '',
			managementFee: 3,
			addLP: false,
			lpCreatorFee: 3,
			lpBetMultiplier: 1,
			lpPointsToWin: 0,
		},
	})

	const step1State = useForm1Return.getValues()
	const step2State = useForm2Return.getValues()

	const [searchParams] = useSearchParams()

	useEffect(() => {
		const importData = searchParams.get('import')

		if (importData !== null) {
			try {
				const data = JSON.parse(importData)

				if (data.title) {
					useForm1Return.setValue('market', data.title)
				}

				if (data.closingTime) {
					useForm1Return.setValue('closingTime', localTimeToUtc(data.closingTime))
				}

				if (data.category) {
					useForm1Return.setValue('category', data.category)
				}

				if (data.events) {
					useForm1Return.setValue(
						'events',
						data.events.map((e: any) => ({
							questionPlaceholder: e.question,
							openingTs: localTimeToUtc(e.openingTs),
							answers: e.answers.map((a: any) => ({ value: a })),
						}))
					)
				}

				if (data.price) {
					useForm2Return.setValue('price', data.price)
				}

				if (data.manager) {
					useForm2Return.setValue('manager', data.manager)
				}

				if (data.managementFee) {
					useForm2Return.setValue('managementFee', data.managementFee)
				}

				if (data.prizeWeights) {
					useForm2Return.setValue(
						'prizeWeights',
						data.prizeWeights.map((p: any) => ({ value: Number(p) }))
					)
				}
			} catch (e) {
				console.error('Failed market import', e)
			}
		}
	}, [searchParams, useForm1Return, useForm2Return])

	const { isPrepared, isSuccess, error, createMarket, marketId } = useMarketForm(
		step1State,
		step2State,
		activeStep === FormSteps.PREVIEW
	)

	const onSubmit = async () => {
		if (step1State && step2State) {
			await createMarket(step1State, step2State)
		}
	}

	useEffect(() => {
		if (isSuccess) {
			setActiveStep(FormSteps.SUCCESS)
		}
	}, [isSuccess])

	useEffect(() => {
		if (step2State.manager === '' && address) {
			useForm2Return.setValue('manager', address || '')
		}
		// eslint-disable-next-line
	}, [address])

	if (!address) {
		return (
			<Alert severity='error'>
				<Trans>Connect your wallet to create a market.</Trans>
			</Alert>
		)
	}

	if (!chain || chain.unsupported) {
		return (
			<Alert severity='error'>
				<Trans>UNSUPPORTED_CHAIN</Trans>
			</Alert>
		)
	}

	if (!isMainChain(chain?.id)) {
		return (
			<Alert severity='error'>
				<Trans>ONLY_MAIN_CHAIN</Trans>
			</Alert>
		)
	}

	return (
		<div>
			{activeStep < FormSteps.SUCCESS && (
				<Banner style={{ backgroundImage: 'url(/banners/banner-3.jpg)' }}>
					<Typography
						variant='h1s'
						dangerouslySetInnerHTML={{
							__html: t`Create a new market<br />in 3 simple steps`,
						}}
					></Typography>
				</Banner>
			)}

			{activeStep < FormSteps.SUCCESS && (
				<div style={{ marginBottom: 50 }}>
					<BigStepper steps={[t`Market detail`, t`Price`, t`Publish`]} activeStep={activeStep} />
				</div>
			)}

			<Container>
				{error && (
					<Alert severity='error' sx={{ mb: 2 }}>
						{error.message}
					</Alert>
				)}

				{activeStep === FormSteps.STEP_1 && <Step1Form useFormReturn={useForm1Return} setActiveStep={setActiveStep} />}

				{activeStep === FormSteps.STEP_2 && (
					<Step2Form
						useFormReturn={useForm2Return}
						setActiveStep={setActiveStep}
						maxPointsToWin={step1State.events.length}
					/>
				)}

				{activeStep === FormSteps.PREVIEW && (
					<PreviewStep
						onSubmit={onSubmit}
						setActiveStep={setActiveStep}
						step1State={step1State}
						step2State={step2State}
						isPrepared={isPrepared}
					/>
				)}

				{activeStep === FormSteps.SUCCESS && (
					<SuccessStep
						marketName={step1State.market}
						marketId={marketId}
						step1State={step1State}
						step2State={step2State}
					/>
				)}
			</Container>
		</div>
	)
}

export default MarketsCreate
