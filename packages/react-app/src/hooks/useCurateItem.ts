import { useQuery } from "react-query";
import {apolloProdeQuery} from "../lib/apolloClient";
import {CurateItem, CURATE_ITEM_FIELDS, Market} from "../graphql/subgraph";

const query = `
    ${CURATE_ITEM_FIELDS}
    query CurateQuery($hash: String) {
        curate(hash: $hash) {
            ...CurateItemFields
        }
    }
`;

export const useCurateItem = (market?: Market) => {
  return useQuery<CurateItem, Error>(
    ["useCurateItem", market],
    async () => {
      const hash = market.hash;
      const response = await apolloProdeQuery<{ curateItem: CurateItem }>(query, {hash});

      if (!response) throw new Error("No response from TheGraph");

      return response.data.curateItem;
    }
  );
};