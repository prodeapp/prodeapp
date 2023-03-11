import { ErrorMessage } from '@hookform/error-message'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
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
import { DEFAULT_CHAIN } from '@/lib/config'
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

	return getMarket(chainId, response.data.markets[0].id)
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

	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()
	const [marketId, setMarketId] = useState('')
	const { data: events } = useEvents(marketId as Address)
	const [results, setResults] = useState<ValidationResult[]>([])
	const [itemJson, setItemJson] = useState<DecodedCurateListFields['Details'] | null>(null)

	const onSubmit = async (data: FormValues) => {
		setMarketId('')

		const _results: ValidationResult[] = []

		let itemProps: DecodedCurateListFields

		setItemJson(null)
		setResults(_results)

		try {
			itemProps = await getDecodedParams(chain.id, data.itemId.toLowerCase())
			setItemJson(itemProps.Details)
		} catch (e) {
			setResults([{ type: 'error', message: i18n._('Item id not found') }])
			return
		}

		const isValid = validate(itemProps.Details)

		_results.push(
			!isValid ? { type: 'error', message: i18n._('Invalid JSON') } : { type: 'success', message: i18n._('Valid JSON') }
		)

		// validate hash
		const market = await fetchMarketByHash(chain.id, itemProps.Hash)

		if (!market) {
			_results.push({
				type: 'error',
				message: i18n._('Market hash not found'),
			})
		} else {
			_results.push({ type: 'success', message: i18n._('Market hash found') })

			const events = await fetchEvents(chain.id, market.id)

			// validate hash
			_results.push(
				getQuestionsHash(events.map(event => event.id)) !== itemProps.Hash
					? { type: 'error', message: i18n._('Invalid market hash') }
					: { type: 'success', message: i18n._('Valid market hash') }
			)

			// validate hash is not already registered
			const marketCurations = await fetchCurateItemsByHash(chain.id, itemProps.Hash)

			_results.push(
				marketCurations.length > 1
					? {
							type: 'error',
							message: i18n._("This market has more than 1 submissions. ItemId's: {0}", {
								0: marketCurations.map(tc => tc.id).join(', '),
							}),
					  }
					: {
							type: 'success',
							message: i18n._('This is the first submission for this market'),
					  }
			)

			// validate timestamp
			_results.push(
				market.closingTime <= Number(itemProps['Starting timestmap'])
					? { type: 'success', message: i18n._('Valid starting timestamp') }
					: {
							type: 'error',
							message: i18n._('Starting timestamp is earlier than the betting deadline'),
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
						<Trans id='Item Id' />
					</BoxLabelCell>
					<div style={{ width: '100%' }}>
						<TextField
							{...register('itemId', {
								required: i18n._('This field is required.'),
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
							<Trans id='Validate' />
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
