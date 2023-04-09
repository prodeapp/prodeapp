import { ErrorMessage } from '@hookform/error-message'
import { t } from '@lingui/macro'
import TextField from '@mui/material/TextField'
import React from 'react'
import { useFormContext } from 'react-hook-form'

import { FormError } from '@/components/index'
import { MarketFormStep1Values } from '@/hooks/useMarketForm'

type QuestionBuilderProps = {
	eventIndex: number
}

export default function QuestionBuilder({ eventIndex }: QuestionBuilderProps) {
	const {
		register,
		formState: { errors },
	} = useFormContext<MarketFormStep1Values>()

	return (
		<div style={{ flexGrow: 1 }}>
			<div style={{ display: 'flex' }}>
				<TextField
					{...register(`events.${eventIndex}.questionPlaceholder`, {
						required: t`This field is required.`,
						validate: (v) =>
							v.includes('?') ||
							t`The event name must be a question written in english, for example: 'Who will win the match between Barcelona and Real Madrid at the Champions League 2022/2023 Final?'`,
					})}
					error={!!errors.events?.[eventIndex]?.questionPlaceholder}
					style={{ flexGrow: 1 }}
				/>
			</div>
			<FormError>
				<ErrorMessage errors={errors} name={`events.${eventIndex}.questionPlaceholder`} />
			</FormError>
		</div>
	)
}
