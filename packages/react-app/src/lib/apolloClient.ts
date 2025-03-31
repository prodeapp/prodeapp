import { ApolloClient, gql, InMemoryCache, NormalizedCacheObject } from '@apollo/client'

import { filterChainId, NetworkId } from '@/lib/config'

const prodeClients: Record<number, ApolloClient<NormalizedCacheObject>> = {
	[NetworkId.GNOSIS]: new ApolloClient({
		uri: 'https://gateway.thegraph.com/api/e60348b11f3412e3dd726b014f71e862/subgraphs/id/2RMPtY3XUNRmRfnbj3fdRM1zHtUntTuCWnc5b13JcXPf',
		cache: new InMemoryCache(),
	}),
	[NetworkId.POLYGON_TESTNET]: new ApolloClient({
		uri: 'https://api.thegraph.com/subgraphs/name/prodeapp/prodeapp-mumbai',
		cache: new InMemoryCache(),
	}),
}

const realityClients: Record<number, ApolloClient<NormalizedCacheObject>> = {
	[NetworkId.GNOSIS]: new ApolloClient({
		uri: 'https://api.thegraph.com/subgraphs/name/realityeth/realityeth-xdai',
		cache: new InMemoryCache(),
	}),
	[NetworkId.POLYGON_TESTNET]: new ApolloClient({
		uri: 'https://api.thegraph.com/subgraphs/name/realityeth/realityeth-mumbai',
		cache: new InMemoryCache(),
	}),
}

const apolloProdeQuery = async <T>(chainId: number, queryString: string, variables: Record<string, any> = {}) => {
	return apolloQuery<T>(prodeClients[filterChainId(chainId)], queryString, variables)
}

const apolloRealityQuery = async <T>(chainId: number, queryString: string, variables: Record<string, any> = {}) => {
	return apolloQuery<T>(realityClients[filterChainId(chainId)], queryString, variables)
}

const apolloQuery = async <T>(
	client: ApolloClient<NormalizedCacheObject>,
	queryString: string,
	variables: Record<string, any> = {}
) => {
	try {
		return client.query<T>({
			query: gql(queryString),
			variables: variables,
		})
	} catch (err) {
		console.error('graph ql error: ', err)
	}
}

export { apolloProdeQuery, apolloRealityQuery }
