import {useQuery} from "@tanstack/react-query";
import {CurateItem} from "../graphql/subgraph";
import {fetchCurateItemsByHash} from "../lib/curate";

export const useCurateItems = (marketHash: string) => {
  return useQuery<CurateItem[], Error>(
    ["useCurateItem", marketHash],
    async () => {
      return fetchCurateItemsByHash(marketHash);
    }
  );
};