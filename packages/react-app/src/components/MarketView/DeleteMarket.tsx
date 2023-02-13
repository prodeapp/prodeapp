import { Trans } from '@lingui/react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import { Address } from '@wagmi/core'
import React from 'react'

import { KeyValueAbi } from '@/abi/KeyValue'
import { useSendRecklessTx } from '@/hooks/useSendTx'

function DeleteMarket({ marketId }: { marketId: string }) {
	const { isSuccess, write } = useSendRecklessTx({
		address: import.meta.env.VITE_KEY_VALUE as Address,
		abi: KeyValueAbi,
		functionName: 'deleteMarket',
	})

	const deleteMarket = async () => {
		write!({
			recklesslySetUnpreparedArgs: [marketId],
		})
	}

	if (isSuccess) {
		return (
			<Alert severity='success'>
				<Trans id='This market has been deleted.' />
			</Alert>
		)
	}

	return (
		<Button variant='text' size='small' color='error' onClick={deleteMarket}>
			<Trans id='Delete market' />
		</Button>
	)
}

export default DeleteMarket
