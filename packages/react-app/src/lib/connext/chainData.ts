import { fetchJson } from '@ethersproject/web'

export type ChainDataSubgraph = {
	query: string
	health: string
}

export type ChainData = {
	name: string
	chainId: number
	domainId: string
	confirmations: number
	shortName: string
	type: 'mainnet' | 'testnet' | ''
	chain: string
	network: string
	networkId: number
	nomadDomain: string
	nativeCurrency: {
		name: string
		symbol: string
		decimals: string
	}
	assetId: Record<
		string,
		{
			name: string
			symbol: string
			mainnetEquivalent?: string
			decimals?: number
		}
	>
	rpc: string[]
	subgraph: string[]
	analyticsSubgraph?: string[]
	subgraphs: {
		runtime: ChainDataSubgraph[]
		analytics: ChainDataSubgraph[]
	}
	faucets: string[]
	infoURL: string
	gasStations: string[]
	explorers: {
		name: string
		url: string
		icon: string
		standard: string
	}[]
	gasEstimates: {
		xcall: string
		execute: string
		xcallL1: string
		executeL1: string
		gasPriceFactor?: string
	}
}

export const chainDataToMap = (data: any, ignoreMissing = true): Map<string, ChainData> => {
	const chainData: Map<string, ChainData> = new Map()
	const noDomainIdFound: string[] = []
	for (let i = 0; i < data.length; i++) {
		const item = data[i]
		const domainId = item.domainId as string | undefined
		// NOTE: Ignore domain 0, as that is a placeholder for a ChainData entry template.
		if (domainId && domainId !== '0') {
			chainData.set(domainId, item as ChainData)
		} else {
			noDomainIdFound.push(item.chainId as string)
		}
	}
	if (noDomainIdFound.length > 0) {
		if (!ignoreMissing) {
			console.warn(
				`No domainId was found for the following chains: ${noDomainIdFound.join(
					', '
				)};\nContinuing without indexing these chains.`
			)
		}
	}
	return chainData
}

export const getChainData = async (useCached?: boolean, ignoreMissing?: boolean): Promise<Map<string, ChainData>> => {
	/*if (useCached && fs.existsSync("./chaindata.json")) {
    console.info("Using cached chain data.");
    const data = JSON.parse(fs.readFileSync("./chaindata.json", "utf-8"));
    return chainDataToMap(data, ignoreMissing);
  }*/

	const url = 'https://chaindata.connext.ninja'
	try {
		const data = await fetchJson(url)
		return chainDataToMap(data, ignoreMissing)
	} catch (err) {
		const url = 'https://raw.githubusercontent.com/connext/chaindata/main/crossChain.json'
		try {
			const data = await fetchJson(url)
			return chainDataToMap(data, ignoreMissing)
		} catch (err) {
			// Check to see if we have the chain data cached locally.
			/*if (fs.existsSync("./chaindata.json")) {
        console.info("Using cached chain data.");
        const data = JSON.parse(fs.readFileSync("./chaindata.json", "utf-8"));
        return chainDataToMap(data, ignoreMissing);
      }*/
			// It could be dangerous to let any agent start without chain data.
			throw new Error('Could not get chain data, and no cached chain data was available.')
		}
	}
}
