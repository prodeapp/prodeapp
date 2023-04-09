import { ErrorMessage } from '@hookform/error-message'
import { t } from '@lingui/macro'
import { Trans } from '@lingui/macro'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { Address } from '@wagmi/core'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNetwork } from 'wagmi'

import { BoxLabelCell, BoxRow, BoxWrapper, FormError } from '@/components'
import validate from '@/components/Curate/schema'
import { RenderTournament } from '@/components/Tournament/RenderTournament'
import { GraphMarket, Market, MARKET_FIELDS } from '@/graphql/subgraph'
import { fetchEvents, useEvents } from '@/hooks/useEvents'
import { getMarket } from '@/hooks/useMarket'
import { apolloProdeQuery } from '@/lib/apolloClient'
import { filterChainId } from '@/lib/config'
import { DecodedCurateListFields, fetchCurateItemsByHash, getDecodedParams } from '@/lib/curate'
import { getQuestionsHash } from '@/lib/reality'

type FormValues = {
	itemId: string
}

const fetchMarketByHash = async (chainId: number, hash: string): Promise<Market | undefined> => {
	const query = `
    ${MARKET_FIELDS}
    query MarketQuery($hash: String) {
        markets(where: {hash: $hash}) {
            ...MarketFields
        }
    }
`

	const response = await apolloProdeQuery<{ markets: GraphMarket[] }>(chainId, query, {
		hash,
	})

	if (!response) throw new Error('No response from TheGraph')

	return getMarket(response.data.markets[0].id, chainId)
}

interface ValidationResult {
	type: 'error' | 'success'
	message: string
}

function CurateValidator() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>({
		defaultValues: {
			itemId: '',
		},
	})

	const { chain } = useNetwork()
	const chainId = filterChainId(chain?.id)
	const [marketId, setMarketId] = useState('')
	const { data: events } = useEvents(marketId as Address, chainId)
	const [results, setResults] = useState<ValidationResult[]>([])
	const [itemJson, setItemJson] = useState<DecodedCurateListFields['Details'] | null>(null)

	const onSubmit = async (data: FormValues) => {
		setMarketId('')

		const _results: ValidationResult[] = []

		let itemProps: DecodedCurateListFields

		setItemJson(null)
		setResults(_results)

		try {
			itemProps = await getDecodedParams(chainId, data.itemId.toLowerCase())
			setItemJson(itemProps.Details)
		} catch (e) {
			setResults([{ type: 'error', message: t`Item id not found` }])
			return
		}

		const isValid = validate(itemProps.Details)

		_results.push(!isValid ? { type: 'error', message: t`Invalid JSON` } : { type: 'success', message: t`Valid JSON` })

		// validate hash
		const market = await fetchMarketByHash(chainId, itemProps.Hash)

		if (!market) {
			_results.push({
				type: 'error',
				message: t`Market hash not found`,
			})
		} else {
			_results.push({ type: 'success', message: t`Market hash found` })

			const events = await fetchEvents(chainId, market.id)

			// validate hash
			_results.push(
				getQuestionsHash(events.map((event) => event.id)) !== itemProps.Hash
					? { type: 'error', message: t`Invalid market hash` }
					: { type: 'success', message: t`Valid market hash` }
			)

			// validate hash is not already registered
			const marketCurations = await fetchCurateItemsByHash(chainId, itemProps.Hash)

			_results.push(
				marketCurations.length > 1
					? {
							type: 'error',
							message: t`This market has more than 1 submissions. ItemId's: ${marketCurations
								.map((tc) => tc.id)
								.join(', ')}`,
					  }
					: {
							type: 'success',
							message: t`This is the first submission for this market`,
					  }
			)

			// validate timestamp
			_results.push(
				market.closingTime <= Number(itemProps['Starting timestmap'])
					? { type: 'success', message: t`Valid starting timestamp` }
					: {
							type: 'error',
							message: t`Starting timestamp is earlier than the betting deadline`,
					  }
			)

			setMarketId(market.id)
		}

		setResults(_results)
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<BoxWrapper>
				<BoxRow>
					<BoxLabelCell>
						<Trans>Item Id</Trans>
					</BoxLabelCell>
					<div style={{ width: '100%' }}>
						<TextField
							{...register('itemId', {
								required: t`This field is required.`,
							})}
							style={{ width: '100%' }}
						/>
						<FormError>
							<ErrorMessage errors={errors} name='itemId' />
						</FormError>
					</div>
				</BoxRow>
				<BoxRow>
					<div style={{ textAlign: 'center', width: '100%', marginTop: '20px' }}>
						<Button type='submit'>
							<Trans>Validate</Trans>
						</Button>
					</div>
				</BoxRow>
			</BoxWrapper>

			{results.map((result, i) => (
				<Alert severity={result.type} key={i}>
					{result.message}
				</Alert>
			))}

			{events && itemJson && <RenderTournament events={events} itemJson={itemJson} />}
		</form>
	)
}

export default CurateValidator
