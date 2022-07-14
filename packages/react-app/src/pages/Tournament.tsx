import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {useEvents} from "../hooks/useEvents";
import {
  DecodedCurateListFields,
  fetchCurateItemsByHash,
  getDecodedParams
} from "../lib/curate";
import {BracketsFromList} from "../components/Brackets/Brackets";
import {useMarket} from "../hooks/useMarket";
import Alert from "@mui/material/Alert";

function Tournament() {
  const { id } = useParams();
  const { data: market } = useMarket(String(id))
  const { isLoading, data: events } = useEvents(String(id));
  const [itemJson, setItemJson] = useState<DecodedCurateListFields['JASON'] | null>(null);

  useEffect(() => {
    if (!market) {
      return;
    }
    (async () => {
      const curateItems = await fetchCurateItemsByHash(market.hash);

      if (curateItems.length > 0) {
        const itemProps = await getDecodedParams(curateItems[0].id)
        setItemJson(itemProps.JASON)
      }
    })();
  }, [market])

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {events && !itemJson && <Alert severity="error">This market is not verified.</Alert>}
      {events && itemJson && <BracketsFromList events={events} itemJson={itemJson}/>}
    </div>
  );
}

export default Tournament;
