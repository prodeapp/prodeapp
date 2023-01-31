import { ErrorMessage } from '@hookform/error-message'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import Button from '@mui/material/Button'
import FormHelperText from '@mui/material/FormHelperText'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import React, { useEffect } from 'react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'

import { ReactComponent as CrossIcon } from '@/assets/icons/cross.svg'
import { FormError } from '@/components/index'
import { MarketFormStep2Values } from '@/hooks/useMarketForm'

export default function PrizeWeightsBuilder() {
	const {
		control,
		setValue,
		register,
		formState: { errors },
	} = useFormContext<MarketFormStep2Values>()

	const { fields: prizesFields, append: appendPrizesField, remove: removePrizesField } = useFieldArray({
		control,
		name: 'prizeWeights',
	})

	const prizeWeights = useWatch({ control, name: 'prizeWeights' })

	useEffect(() => {
		setValue(
			'prizeDivisor',
			prizeWeights.map(pw => Number(pw.value)).reduce((partialSum, a) => partialSum + a, 0),
			{ shouldValidate: true }
		)
	}, [setValue, prizeWeights])

	const deletePrizeWeight = (i: number) => {
		return () => removePrizesField(i)
	}

	const addPrizeWeight = () => appendPrizesField({ value: 0 })

	return (
		<div>
			{prizesFields.length === 0 && (
				<FormError style={{ marginBottom: '5px' }}>
					<Trans id='Add at least one prize weight.' />
				</FormError>
			)}
			<Grid container spacing={2}>
				{prizesFields.map((answerField, i) => {
					return (
						<Grid item xs={6} md={4} key={answerField.id}>
							<div>
								<TextField
									{...register(`prizeWeights.${i}.value`, {
										required: i18n._('This field is required.'),
									})}
									error={!!errors.prizeWeights?.[i]?.value}
									type='number'
									fullWidth
									InputProps={{
										endAdornment: (
											<div style={{ cursor: 'pointer', marginLeft: '10px' }} onClick={deletePrizeWeight(i)}>
												<CrossIcon width={15} height={15} />
											</div>
										),
									}}
								/>
							</div>
							<FormError>
								<ErrorMessage errors={errors} name={`prizeWeights.${i}.value`} />
							</FormError>
						</Grid>
					)
				})}
			</Grid>
			<FormHelperText>
				<Trans id='What % of the pool will win the player ranked at position #X.' />
			</FormHelperText>
			<FormError>
				<ErrorMessage errors={errors} name={`prizeDivisor`} />
			</FormError>
			{prizesFields.length < 3 && (
				<Button onClick={addPrizeWeight} variant='outlined'>
					<Trans id='Add prize weight' />
				</Button>
			)}
		</div>
	)
}
