import { useQuery } from "react-query";
import {apolloProdeQuery} from "../lib/apolloClient";
import {CurateItem, CURATE_ITEM_FIELDS} from "../graphql/subgraph";

const query = `
    ${CURATE_ITEM_FIELDS}
    query CurateQuery($hash: String!) {
        curateItems(where:{hash: $hash}) {
            ...CurateItemFields
        }
    }
`;

export const useCurateItem = (marketHash?: string) => {
  return useQuery<CurateItem, Error>(
    ["useCurateItems", marketHash],
    async () => {

      const response = await apolloProdeQuery<{ curateItem: CurateItem }>(query, {hash: marketHash?marketHash.toLowerCase():''});

      if (!response) throw new Error("No response from TheGraph");

      return response.data.curateItem;
    }
  );
};