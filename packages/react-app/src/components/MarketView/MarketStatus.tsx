import { Trans } from "@lingui/macro";
import React from "react";
import {useMarketStatus} from "../../hooks/useMarketStatus";

function MarketStatus({marketId}: {marketId: string}) {
  const { data: marketStatus} = useMarketStatus(String(marketId));

  if (marketStatus === '') {
    return null;
  }

  if (marketStatus === 'ACCEPTING_BETS') {
    return <span><Trans>Accepting bets</Trans></span>;
  } else if (marketStatus === 'WAITING_ANSWERS') {
    return <span><Trans>Waiting for results</Trans></span>;
  } else if (marketStatus === 'WAITING_REGISTER_POINTS' || marketStatus === 'WAITING_AVAILABITILY_OF_RESULTS') {
    return <span><Trans>Building ranking</Trans></span>;
  } else if (marketStatus === 'FINALIZED') {
    return <span><Trans>Finished</Trans></span>;
  }

  return <span></span>;
}

export default MarketStatus;
