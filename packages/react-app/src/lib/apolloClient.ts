import { ApolloClient, gql, InMemoryCache, NormalizedCacheObject } from '@apollo/client'

import { DEFAULT_CHAIN, NetworkId } from '@/lib/config'

const prodeClients: Record<number, ApolloClient<NormalizedCacheObject>> = {
	[NetworkId.GNOSIS]: new ApolloClient({
		uri: 'https://api.thegraph.com/subgraphs/name/prodeapp/prodeapp',
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
	return apolloQuery<T>(prodeClients[chainId] || prodeClients[DEFAULT_CHAIN], queryString, variables)
}

const apolloRealityQuery = async <T>(chainId: number, queryString: string, variables: Record<string, any> = {}) => {
	return apolloQuery<T>(realityClients[chainId] || realityClients[DEFAULT_CHAIN], queryString, variables)
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
