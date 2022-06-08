import React from "react";
import {useMarketStatus} from "../../hooks/useMarketStatus";

function MarketStatus({marketId}: {marketId: string}) {
  const { data: marketStatus} = useMarketStatus(String(marketId));

  if (marketStatus === '') {
    return null;
  }

  if (marketStatus === 'ACCEPTING_BETS') {
    return <span>Accepting bets</span>;
  } else if (marketStatus === 'WAITING_ANSWERS') {
    return <span>Waiting for results</span>;
  } else if (marketStatus === 'WAITING_REGISTER_POINTS' || marketStatus === 'WAITING_AVAILABITILY_OF_RESULTS') {
    return <span>Building ranking</span>;
  } else if (marketStatus === 'FINALIZED') {
    return <span>Finished</span>;
  }

  return <span></span>;
}

export default MarketStatus;
