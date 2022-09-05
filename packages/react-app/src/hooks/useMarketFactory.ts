import { useQuery } from "@tanstack/react-query";
import { apolloProdeQuery } from "../lib/apolloClient";
import { MarketFactory, MARKET_FACTORY_FIELDS } from "../graphql/subgraph";

const query = `
    ${MARKET_FACTORY_FIELDS}
    query MarketFactoriesQuery {
        marketFactories {
                ...MarketFactoryFields
          }
    }
`;

export const useMarketFactory = () => {
    return useQuery<MarketFactory | undefined, Error>(
        ["useMarketFactory"],
        async () => {
            const response = await apolloProdeQuery<{ marketFactories: MarketFactory[] }>(query);

            if (!response) throw new Error("No response from TheGraph");

            return response.data.marketFactories[0];
        }
    );
};