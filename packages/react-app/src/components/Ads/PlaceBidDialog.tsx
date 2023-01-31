import { Trans } from '@lingui/react'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Bytes } from '@/abi/types'
import AppDialog, { DialogProps } from '@/components/Dialog'
import { BidInfo } from '@/pages/AdsView'

import PlaceBidForm, { PlaceBidFormValues } from './PlaceBidForm'

type PlaceBidDialogProps = DialogProps & {
	itemId: Bytes
	bidInfo: BidInfo
}

function PlaceBidDialog({ open, handleClose, itemId, bidInfo }: PlaceBidDialogProps) {
	const {
		register,
		formState: { errors },
		handleSubmit,
		setValue,
		watch,
	} = useForm<PlaceBidFormValues>({
		defaultValues: {
			market: '',
			bid: '0',
			bidPerSecond: '0',
		},
	})

	const [showActions, setShowActions] = useState(false)

	useEffect(() => {
		setValue('market', bidInfo.market)
		setValue('bidPerSecond', bidInfo.bidPerSecond)
	}, [bidInfo, setValue])

	const dialogActions = (
		<DialogActions>
			<Button autoFocus color='primary' type='submit' form='place-bid-form'>
				<Trans id='Place Bid' />
			</Button>
		</DialogActions>
	)

	return (
		<AppDialog open={open} handleClose={handleClose} title={'Place bid'} actions={showActions && dialogActions}>
			<PlaceBidForm
				{...{
					itemId,
					currentBid: bidInfo.bid,
					register,
					errors,
					watch,
					handleSubmit,
					setShowActions,
				}}
			/>
		</AppDialog>
	)
}

export default PlaceBidDialog
