import { Trans } from "@lingui/macro";
import { Skeleton } from "@mui/material";
import React from "react";
import {useMarketStatus} from "../../hooks/useMarketStatus";
import {useSubmissionPeriodEnd} from "../../hooks/useSubmissionPeriodEnd";
import {getTimeLeft} from "../../lib/helpers";
import {useI18nContext} from "../../lib/I18nContext";

function MarketStatus({marketId}: {marketId: string}) {
  const { data: marketStatus} = useMarketStatus(marketId);
  const submissionPeriodEnd = useSubmissionPeriodEnd(marketId);
  const { locale } = useI18nContext();

  if (marketStatus === '') {
    return <Skeleton />;
  }

  if (marketStatus === 'ACCEPTING_BETS') {
    return <span><Trans>Accepting bets</Trans></span>;
  } else if (marketStatus === 'WAITING_ANSWERS') {
    return <span><Trans>Waiting for results</Trans></span>;
  } else if (marketStatus === 'WAITING_REGISTER_POINTS' || marketStatus === 'WAITING_AVAILABITILY_OF_RESULTS') {
    return <div>
      <div><Trans>Building ranking</Trans></div>
      <div style={{fontSize: '14px', marginTop: '10px'}}><Trans>Prize distribution:</Trans> {getTimeLeft(submissionPeriodEnd, false, locale)}</div>
    </div>;
  } else if (marketStatus === 'FINALIZED') {
    return <span><Trans>Finished</Trans></span>;
  }

  return <span></span>;
}

export default MarketStatus;
