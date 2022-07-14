import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {useEvents} from "../hooks/useEvents";
import {
  DecodedCurateListFields,
  fetchCurateItemsByHash,
  getDecodedParams
} from "../lib/curate";
import {useMarket} from "../hooks/useMarket";
import Alert from "@mui/material/Alert";
import {RenderTournament} from "../components/Tournament/RenderTournament";

function Tournament() {
  const { id } = useParams();
  const { isLoading: isLoadingMarket, data: market } = useMarket(String(id))
  const { isLoading: isLoadingEvents, data: events } = useEvents(String(id));
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

  if (isLoadingMarket || isLoadingEvents) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {events && !itemJson && <Alert severity="error">This market is not verified.</Alert>}
      {events && itemJson && <RenderTournament events={events} itemJson={itemJson}/>}
    </div>
  );
}

export default Tournament;
