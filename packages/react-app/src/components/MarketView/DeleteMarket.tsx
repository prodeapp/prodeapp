import { Trans } from '@lingui/react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import React from 'react'
import { useNetwork } from 'wagmi'

import { KeyValueAbi } from '@/abi/KeyValue'
import { useSendRecklessTx } from '@/hooks/useSendTx'
import { DEFAULT_CHAIN, KEY_VALUE_ADDRESSES } from '@/lib/config'

function DeleteMarket({ marketId }: { marketId: string }) {
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()
	const { isSuccess, write } = useSendRecklessTx({
		address: KEY_VALUE_ADDRESSES[chain.id as keyof typeof KEY_VALUE_ADDRESSES],
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
