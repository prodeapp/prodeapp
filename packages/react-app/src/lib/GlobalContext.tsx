import React, { useState } from 'react'

import { MarketStatus, UseMarketsProps } from '@/hooks/useMarkets'

interface MarketFiltersProp {
	curated: UseMarketsProps['curated']
	setCurated: (curated: boolean) => void
	status: UseMarketsProps['status']
	setStatus: (status: MarketStatus) => void
	category: NonNullable<UseMarketsProps['category']>
	setCategory: (category: string) => void
	filters: UseMarketsProps
}

interface AdsFiltersProp {
	market: string
	setMarket: (market: string) => void
	filters: {
		market: string
	}
}

interface GlobalContextInterface {
	marketFilters: MarketFiltersProp
	adsFilters: AdsFiltersProp
}

export const GlobalContext = React.createContext<GlobalContextInterface>({} as GlobalContextInterface)

const useMarketFilters = (): MarketFiltersProp => {
	const [curated, setCurated] = useState<boolean>(false)
	const [status, setStatus] = useState<MarketStatus>('active')
	const [category, setCategory] = useState('All')

	return {
		curated,
		setCurated,
		status,
		setStatus,
		category,
		setCategory,
		filters: {
			curated: curated ? curated : undefined,
			status,
			category: category === 'All' ? '' : category,
			minEvents: 3,
		},
	}
}

const useAdsFilters = (): AdsFiltersProp => {
	const [market, setMarket] = useState<string>('')

	return {
		market,
		setMarket,
		filters: {
			market,
		},
	}
}

export const GlobalContextProvider = ({ children }: { children: React.ReactNode }) => {
	const marketFilters = useMarketFilters()
	const adsFilters = useAdsFilters()

	return <GlobalContext.Provider value={{ marketFilters, adsFilters }}>{children}</GlobalContext.Provider>
}
