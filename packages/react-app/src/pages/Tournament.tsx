import Alert from '@mui/material/Alert'
import { Address } from '@wagmi/core'
import React from 'react'
import { useParams } from 'react-router-dom'

import { RenderTournament } from '@/components/Tournament/RenderTournament'
import { useCurateItemJson } from '@/hooks/useCurateItems'
import { useEvents } from '@/hooks/useEvents'
import { useMarket } from '@/hooks/useMarket'

function Tournament() {
	const { id } = useParams()
	const { isLoading: isLoadingMarket, data: market } = useMarket(String(id) as Address)
	const { isLoading: isLoadingEvents, data: events } = useEvents(String(id) as Address)
	const itemJson = useCurateItemJson(market?.hash || '')

	if (isLoadingMarket || isLoadingEvents) {
		return <div>Loading...</div>
	}

	return (
		<div>
			{(!market || !market.curated) && <Alert severity='error'>This market is not verified.</Alert>}
			{events && itemJson && <RenderTournament events={events} itemJson={itemJson} />}
		</div>
	)
}

export default Tournament
