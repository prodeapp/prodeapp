import { ApolloClient, gql, InMemoryCache } from "@apollo/client";

const client = () =>
  new ApolloClient({
    uri: "https://api.thegraph.com/subgraphs/name/prodeapp/prodeapp",
    cache: new InMemoryCache(),
  });

const apollo = async<T>(queryString: string, variables: Record<string, any> = {}) => {
  try {
    return client().query<T>({
      query: gql(queryString),
      variables: variables
    });
  } catch (err) {
    console.error("graph ql error: ", err);
  }
};

export default apollo;