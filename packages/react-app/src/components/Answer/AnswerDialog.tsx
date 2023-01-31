import { Trans } from '@lingui/react'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

import AppDialog, { DialogProps } from '@/components/Dialog'
import { Event } from '@/graphql/subgraph'

import AnswerForm, { AnswerFormValues } from './AnswerForm'

type AnswerDialogProps = DialogProps & {
	event: Event
}

function AnswerDialog({ open, handleClose, event }: AnswerDialogProps) {
	const {
		register,
		control,
		formState: { errors },
		handleSubmit,
	} = useForm<AnswerFormValues>({
		defaultValues: {
			outcome: '',
		},
	})

	const [showActions, setShowActions] = useState(false)

	const dialogActions = (
		<DialogActions>
			<Button autoFocus color='primary' type='submit' form='answer-form'>
				<Trans id='Submit answer' />
			</Button>
		</DialogActions>
	)

	return (
		<AppDialog open={open} handleClose={handleClose} title={event.title} actions={showActions && dialogActions}>
			<AnswerForm {...{ event, register, control, errors, handleSubmit, setShowActions }} />
		</AppDialog>
	)
}

export default AnswerDialog
