import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import React, { useContext } from 'react'
import { useNetwork } from 'wagmi'

import HomeSlider from '@/components/HomeSlider'
import MarketsFilter from '@/components/MarketsFilter'
import MarketsTable from '@/components/MarketsTable'
import { useMarkets } from '@/hooks/useMarkets'
import { filterChainId } from '@/lib/config'
import { GlobalContext } from '@/lib/GlobalContext'

function Home() {
	const { chain } = useNetwork()
	const chainId = filterChainId(chain?.id)
	const { marketFilters } = useContext(GlobalContext)
	const { isLoading, error, data: markets } = useMarkets(chainId, marketFilters.filters)

	return (
		<>
			<HomeSlider />

			<MarketsFilter />

			{isLoading && <CircularProgress />}

			{error && <Alert severity='error'>{error.message}</Alert>}

			{!isLoading && !error && <MarketsTable markets={markets} chainId={chainId} />}
		</>
	)
}

export default Home
