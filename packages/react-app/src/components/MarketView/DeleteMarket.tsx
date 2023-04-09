import { Trans } from '@lingui/macro'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import React from 'react'
import { useNetwork } from 'wagmi'

import { KeyValueAbi } from '@/abi/KeyValue'
import { useSendRecklessTx } from '@/hooks/useSendTx'
import { getConfigAddress } from '@/lib/config'

function DeleteMarket({ marketId }: { marketId: string }) {
	const { chain } = useNetwork()
	const { isSuccess, write } = useSendRecklessTx({
		address: getConfigAddress('KEY_VALUE', chain?.id),
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
				<Trans>This market has been deleted.</Trans>
			</Alert>
		)
	}

	return (
		<Button variant='text' size='small' color='error' onClick={deleteMarket}>
			<Trans>Delete market</Trans>
		</Button>
	)
}

export default DeleteMarket
