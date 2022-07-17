import {ATTRIBUTION_FIELDS, Attribution} from "../graphql/subgraph";
import {useQuery} from "react-query";
import {apolloProdeQuery} from "../lib/apolloClient";
import {buildQuery} from "../lib/SubgraphQueryBuilder";

const query = `
    ${ATTRIBUTION_FIELDS}
    query AttributionsQuery(#params#) {
      attributions(where: {#where#}, orderBy:timestamp, orderDirection:desc) {
        ...AttributionFields
      }
    }
`;

interface Props {
  provider: string
}

export const useAttributions = ({provider}: Props) => {
  return useQuery<Attribution[], Error>(
    ["useAttributions", provider],
    async () => {
      const variables = {provider: provider?.toLowerCase()};

      const response = await apolloProdeQuery<{ attributions: Attribution[] }>(buildQuery(query, variables), variables);
      
      if (!response) throw new Error("No response from TheGraph");
      
      return response.data.attributions;
    },
    {enabled: !!provider}
  );
};