import { ErrorMessage } from '@hookform/error-message'
import { t } from '@lingui/macro'
import { Trans } from '@lingui/macro'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import { Address } from '@wagmi/core'
import React, { useEffect } from 'react'
import { FormProvider, useFieldArray, useForm, useFormContext, useWatch } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useAccount, useNetwork } from 'wagmi'

import { GeneralizedTCRAbi } from '@/abi/GeneralizedTCR'
import { BoxLabelCell, BoxRow, BoxWrapper, FormError } from '@/components'
import { CurateSubmitFormValues } from '@/components/Curate'
import EventsPreview from '@/components/Curate/EventsPreview'
import { useEvents } from '@/hooks/useEvents'
import { useMarket } from '@/hooks/useMarket'
import { useSendRecklessTx } from '@/hooks/useSendTx'
import { useSubmissionDeposit } from '@/hooks/useSubmissionDeposit'
import { filterChainId, getConfigAddress, isMainChain } from '@/lib/config'
import { FORMAT_GROUPS, getEncodedParams, TOURNAMENT_FORMATS } from '@/lib/curate'
import { getQuestionsHash } from '@/lib/reality'

function GroupsForm() {
	const {
		register,
		control,
		formState: { errors },
	} = useFormContext<CurateSubmitFormValues>()

	const useFieldGroupsArrayReturn = useFieldArray({
		control,
		name: `extraDataGroups.groups`,
	})
	const { fields: groupsFields } = useFieldGroupsArrayReturn

	const addGroup = () => {
		return useFieldGroupsArrayReturn.append({
			size: 0,
			name: '',
		})
	}

	const removeGroup = (groupIndex: number) => {
		return useFieldGroupsArrayReturn.remove(groupIndex)
	}

	return (
		<>
			<BoxWrapper>
				<BoxRow>
					<BoxLabelCell>
						<Trans>Groups</Trans>
					</BoxLabelCell>
				</BoxRow>
				{groupsFields.length > 0 &&
					groupsFields.map((groupField, i) => {
						return (
							<BoxRow key={groupField.id} style={{ flexDirection: 'column' }}>
								<div style={{ width: '100%', display: 'flex', padding: '5px 0' }}>
									<BoxLabelCell>
										<Trans>Number of questions</Trans>
									</BoxLabelCell>
									<div style={{ width: '100%', display: 'flex' }}>
										<TextField
											{...register(`extraDataGroups.groups.${i}.size`, {
												required: t`This field is required.`,
												valueAsNumber: true,
												validate: (v) => !isNaN(Number(v)) || 'Invalid number.',
												min: {
													value: 1,
													message: t`Value must be greater than 0.`,
												},
											})}
											style={{ width: '100%' }}
										/>
										<FormError>
											<ErrorMessage errors={errors} name={`extraDataGroups.groups.${i}.size`} />
										</FormError>
									</div>
								</div>
								<div style={{ width: '100%', display: 'flex', padding: '5px 0' }}>
									<BoxLabelCell>Name</BoxLabelCell>
									<div style={{ width: '100%', display: 'flex' }}>
										<TextField
											{...register(`extraDataGroups.groups.${i}.name`, {
												required: t`This field is required.`,
											})}
											style={{ width: '100%' }}
										/>
										<FormError>
											<ErrorMessage errors={errors} name={`extraDataGroups.groups.${i}.name`} />
										</FormError>
									</div>
								</div>
								<div
									style={{
										width: '100%',
										textAlign: 'center',
										marginTop: '20px',
									}}
								>
									<Button onClick={() => removeGroup(i)}>
										- <Trans>Remove group</Trans>
									</Button>
								</div>
							</BoxRow>
						)
					})}
				<BoxRow>
					<div style={{ textAlign: 'center', width: '100%' }}>
						<Button onClick={addGroup}>
							+ <Trans>Add group</Trans>
						</Button>
					</div>
				</BoxRow>

				<BoxRow>
					<BoxLabelCell>Rounds</BoxLabelCell>
					<div style={{ width: '100%' }}>
						<TextField
							{...register(`extraDataGroups.rounds`, {
								required: t`This field is required.`,
								valueAsNumber: true,
								validate: (v) => !isNaN(Number(v)) || t`Invalid number.`,
								min: {
									value: 1,
									message: t`Value must be greater than 0.`,
								},
							})}
						/>
						<FormError>
							<ErrorMessage errors={errors} name={`extraDataGroups.rounds`} />
						</FormError>
					</div>
				</BoxRow>
			</BoxWrapper>
		</>
	)
}

function CurateSubmit() {
	const { chain } = useNetwork()
	const chainId = filterChainId(chain?.id)
	const { marketId } = useParams()
	const { data: market } = useMarket(String(marketId) as Address, chainId)
	const { isLoading, data: events } = useEvents(String(marketId) as Address, chainId)

	const { address } = useAccount()

	const { data: submissionDeposit } = useSubmissionDeposit(getConfigAddress('CURATE_REGISTRY', chainId), chainId)

	const useFormReturn = useForm<CurateSubmitFormValues>({
		defaultValues: {
			name: '',
			description: '',
			format: '',
			questions: [],
			startingTimestamp: '',
			extraDataGroups: {
				groups: [],
				rounds: 0,
			},
		},
	})

	const {
		register,
		control,
		handleSubmit,
		formState: { errors },
		setValue,
	} = useFormReturn

	const questionsUseFieldArrayReturn = useFieldArray({
		control,
		name: 'questions',
	})

	const format = useWatch({ control, name: 'format' })

	const { isSuccess, error, write } = useSendRecklessTx({
		address: getConfigAddress('CURATE_REGISTRY', chainId),
		abi: GeneralizedTCRAbi,
		functionName: 'addItem',
	})

	useEffect(() => {
		if (questionsUseFieldArrayReturn.fields.length > 0 || !events) {
			return
		}

		events.forEach((e) => {
			questionsUseFieldArrayReturn.append({ value: e.id })
		})
		// eslint-disable-next-line
	}, [events])

	useEffect(() => {
		if (market) {
			setValue('name', market.name)
			setValue('startingTimestamp', market.closingTime.toString())
		}
	}, [market, setValue])

	if (!address) {
		return <Alert severity='error'>{t`Connect your wallet to verify a market.`}</Alert>
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

	if (isLoading) {
		return (
			<div>
				<Trans>Loading...</Trans>
			</div>
		)
	}

	if (!events) {
		return (
			<Alert severity='error'>
				<Trans>Market not found.</Trans>
			</Alert>
		)
	}

	const onSubmit = async (data: CurateSubmitFormValues) => {
		try {
			const encodedParams = await getEncodedParams(
				chainId,
				data,
				getQuestionsHash(data.questions.map((question) => question.value)),
				data.questions.map((question) => question.value)
			)

			write!({
				recklesslySetUnpreparedArgs: [encodedParams],
				recklesslySetUnpreparedOverrides: {
					value: submissionDeposit,
				},
			})
		} catch (e) {
			alert(e instanceof Error ? e.message : t`Unexpected error`)
		}
	}

	if (isSuccess) {
		return (
			<Alert severity='success'>
				<Trans>Market sent to Kleros Curate</Trans>
			</Alert>
		)
	}

	return (
		<FormProvider {...useFormReturn}>
			<form onSubmit={handleSubmit(onSubmit)}>
				{error && (
					<Alert severity='error' sx={{ mb: 2 }}>
						{error.message}
					</Alert>
				)}
				<BoxWrapper>
					<BoxRow>
						<BoxLabelCell>
							<Trans>Market name</Trans>
						</BoxLabelCell>
						<div style={{ width: '100%' }}>
							<TextField
								{...register('name', {
									required: t`This field is required.`,
								})}
								style={{ width: '100%' }}
							/>
							<FormError>
								<ErrorMessage errors={errors} name='name' />
							</FormError>
						</div>
					</BoxRow>
					<BoxRow>
						<BoxLabelCell>
							<Trans>Description</Trans>
						</BoxLabelCell>
						<div style={{ width: '100%' }}>
							<TextField {...register('description')} style={{ width: '100%' }} />
							<FormError>
								<ErrorMessage errors={errors} name='description' />
							</FormError>
						</div>
					</BoxRow>
					<BoxRow>
						<BoxLabelCell>
							<Trans>Starting timestamp</Trans>
						</BoxLabelCell>
						<div style={{ width: '100%' }}>
							<TextField
								{...register('startingTimestamp', {
									required: t`This field is required.`,
								})}
								style={{ width: '100%' }}
							/>
							<FormError>
								<ErrorMessage errors={errors} name='startingTimestamp' />
							</FormError>
						</div>
					</BoxRow>
					<BoxRow>
						<BoxLabelCell>
							<Trans>Format</Trans>
						</BoxLabelCell>
						<div style={{ width: 200 }}>
							<FormControl fullWidth>
								<Select
									defaultValue=''
									id={`market-format`}
									{...register(`format`, {
										required: t`This field is required.`,
									})}
								>
									{Object.keys(TOURNAMENT_FORMATS).map((format, i) => (
										<MenuItem value={format} key={i}>
											{TOURNAMENT_FORMATS[format]}
										</MenuItem>
									))}
								</Select>
								<FormError>
									<ErrorMessage errors={errors} name={`format`} />
								</FormError>
							</FormControl>
						</div>
					</BoxRow>
				</BoxWrapper>

				{format === FORMAT_GROUPS && <GroupsForm />}

				<BoxWrapper>
					{events && format && (
						<BoxRow>
							<div style={{ width: '100%' }}>
								<EventsPreview useFieldArrayReturn={questionsUseFieldArrayReturn} events={events} />
							</div>
						</BoxRow>
					)}
					<BoxRow>
						<div style={{ textAlign: 'center', width: '100%', marginTop: '20px' }}>
							<Button type='submit'>
								<Trans>Submit</Trans>
							</Button>
						</div>
					</BoxRow>
				</BoxWrapper>
			</form>
		</FormProvider>
	)
}

export default CurateSubmit
