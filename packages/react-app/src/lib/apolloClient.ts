import {
	ApolloClient,
	gql,
	InMemoryCache,
	NormalizedCacheObject,
} from '@apollo/client';

const prodeClient = new ApolloClient({
	uri: 'https://api.thegraph.com/subgraphs/name/prodeapp/prodeapp',
	cache: new InMemoryCache(),
});

const realityClient = new ApolloClient({
	uri: 'https://api.thegraph.com/subgraphs/name/realityeth/realityeth-xdai',
	cache: new InMemoryCache(),
});

const apolloProdeQuery = async <T>(
	queryString: string,
	variables: Record<string, any> = {}
) => {
	return apolloQuery<T>(prodeClient, queryString, variables);
};

const apolloRealityQuery = async <T>(
	queryString: string,
	variables: Record<string, any> = {}
) => {
	return apolloQuery<T>(realityClient, queryString, variables);
};

const apolloQuery = async <T>(
	client: ApolloClient<NormalizedCacheObject>,
	queryString: string,
	variables: Record<string, any> = {}
) => {
	try {
		return client.query<T>({
			query: gql(queryString),
			variables: variables,
		});
	} catch (err) {
		console.error('graph ql error: ', err);
	}
};

export { apolloProdeQuery, apolloRealityQuery };
