import { ErrorMessage } from '@hookform/error-message'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import React from 'react'
import { FieldArrayWithId, useFormContext } from 'react-hook-form'

import { ReactComponent as CrossIcon } from '@/assets/icons/cross.svg'
import { FormError } from '@/components/index'
import { MarketFormStep1Values } from '@/hooks/useMarketForm'

type AnswersBuilderProps = {
	eventIndex: number
	answersFields: FieldArrayWithId[]
	deleteAnswer: (i: number) => () => void
}

export default function AnswersBuilder({ eventIndex, answersFields, deleteAnswer }: AnswersBuilderProps) {
	const {
		register,
		formState: { errors },
	} = useFormContext<MarketFormStep1Values>()

	return (
		<div style={{ width: '100%' }}>
			{answersFields.length < 2 && (
				<FormError style={{ marginBottom: '5px' }}>
					<Trans id='Add at least two answers' />.
				</FormError>
			)}

			<Grid container spacing={2}>
				{answersFields.map((answerField, i) => {
					return (
						<Grid item xs={6} md={4} key={answerField.id}>
							<div>
								<TextField
									{...register(`events.${eventIndex}.answers.${i}.value`, {
										required: i18n._('This field is required.'),
									})}
									error={!!errors.events?.[eventIndex]?.answers?.[i]?.value}
									fullWidth
									InputProps={{
										endAdornment: (
											<div style={{ cursor: 'pointer', marginLeft: '10px' }} onClick={deleteAnswer(i)}>
												<CrossIcon width={15} height={15} />
											</div>
										),
									}}
								/>
							</div>
							<FormError>
								<ErrorMessage errors={errors} name={`events.${eventIndex}.answers.${i}.value`} />
							</FormError>
						</Grid>
					)
				})}
			</Grid>
		</div>
	)
}
