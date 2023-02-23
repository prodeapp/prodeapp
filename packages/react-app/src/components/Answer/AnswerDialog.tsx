import { Trans } from '@lingui/react'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import React, { useState } from 'react'

import AppDialog, { DialogProps } from '@/components/Dialog'
import { Event } from '@/graphql/subgraph'

import AnswerForm from './AnswerForm'

type AnswerDialogProps = DialogProps & {
	event: Event
}

function AnswerDialog({ open, handleClose, event }: AnswerDialogProps) {
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
			<AnswerForm {...{ event, setShowActions }} />
		</AppDialog>
	)
}

export default AnswerDialog
