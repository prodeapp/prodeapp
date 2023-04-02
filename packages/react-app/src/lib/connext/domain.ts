import { ChainData, getChainData } from '@/lib/connext/chainData'

export const chainIdToDomainMapping: Map<number, number> = new Map([
	// mainnets
	[1, 0x657468], // Ethereum ('eth interpreted as int) 6648936
	[10, 0x6f707469], // Optimism (opti interpreted as int) 1869640809
	[56, 0x626e62], // BNB Chain ('bnb interpreted as int) 6450786
	[100, 0x676e6f], // Gnosis Chain ('gno interpreted as int) 6778479
	[137, 0x706f6c79], // Polygon (poly interpreted as int) 1886350457
	[1284, 0x6265616d], // Moonbeam ('beam interpreted as int) 1650811245
	[42161, 0x6172626f], // Arbitrum One ('arbo interpreted as int) 1634886255
	[324, 0x7a6b7363], // zkSync2 Mainnet ('zksc interpreted as int) 2053862243
	// testnets
	[42, 0x6b6f7661], // Kovan (kovan interpreted as int) 1802466913
	[5, 0x676f6572], // Goerli (goerli interpreted as int) 1735353714
	[420, 0x676f7074], // optimism-goerli (gopti interpreted as int) 1735356532
	[69, 0x6b6f7074], // optimism-kovan (kopti interpreted as int) 1802465396
	[80001, 0x2707], // mumbai 9991
	[421613, 0x67617262], // arbitrum-goerli (garb interpreted as int) 1734439522
	[10200, 0x63686961], // gnosis-chiado (chiado interpreted as int) 1667787105
	[97, 0x63686170], // chapel (chapel interpreted as int) 1667785072
	[280, 0x7a6b7374], // zkSync2 Testnet (zkst interpreted as int) 2053862260
	[59140, 0x636f6e74], // Consensys zkEvm test (cont interpreted as int) 1668247156
	// local
	[1337, 133712],
	[1338, 133812],
	[13337, 13337],
	[13338, 13338],
])

export const getChainIdFromDomain = async (domain: string, _chainData?: Map<string, ChainData>): Promise<number> => {
	const chainData = _chainData ?? (await getChainData())

	if (chainData.has(domain)) {
		return chainData.get(domain)!.chainId
	} else {
		throw new Error(`ChainData doesn't have a record for domain: ${domain}`)
	}
}

export function domainToChainId(domainId: number): number {
	const keys = chainIdToDomainMapping.keys()
	let chainId
	for (const key of keys) {
		if (chainIdToDomainMapping.get(key) == domainId) chainId = key
	}

	if (!chainId) {
		throw new Error(`Cannot find corresponding chainId for domain ${domainId}`)
	}

	return chainId
}
