import {useQuery} from "@tanstack/react-query";
import {CurateItem} from "../graphql/subgraph";
import {DecodedCurateListFields, fetchCurateItemsByHash, getDecodedParams} from "../lib/curate";
import {useEffect, useState} from "react";

export const useCurateItems = (marketHash: string) => {
  return useQuery<CurateItem[], Error>(
    ["useCurateItem", marketHash],
    async () => {
      return fetchCurateItemsByHash(marketHash);
    }
  );
};

export const useCurateItemJson = (marketHash: string): DecodedCurateListFields['Details'] | null => {
  const [itemJson, setItemJson] = useState<DecodedCurateListFields['Details'] | null>(null);
  const { data: curateItems, error, isLoading } = useCurateItems(marketHash);

  useEffect(() => {
    if (error || isLoading) {
      setItemJson(null)
      return;
    }

    (async () => {
      if (curateItems.length > 0) {
        const itemProps = await getDecodedParams(curateItems[0].id);
        setItemJson(itemProps.Details);
      }
    })();
  }, [curateItems, error, isLoading]);

  return itemJson;
}