import { i18n } from "@lingui/core"
import { Skeleton } from "@mui/material";
import React from "react";
import {useMarketStatus} from "../../hooks/useMarketStatus";
import {useSubmissionPeriodEnd} from "../../hooks/useSubmissionPeriodEnd";
import {getTimeLeft} from "../../lib/helpers";
import {useI18nContext} from "../../lib/I18nContext";
import Chip from "@mui/material/Chip";

function MarketStatus({marketId}: {marketId: string}) {
  const { data: marketStatus} = useMarketStatus(marketId);
  const submissionPeriodEnd = useSubmissionPeriodEnd(marketId);
  const { locale } = useI18nContext();

  if (marketStatus === '') {
    return <Skeleton />;
  }

  if (marketStatus === 'ACCEPTING_BETS') {
    return <Chip label={i18n._("Accepting bets")} color="success" />
  } else if (marketStatus === 'WAITING_ANSWERS') {
    return <Chip label={i18n._("Waiting for results")} color="warning"/>;
  } else if (marketStatus === 'WAITING_AVAILABITILY_OF_RESULTS') {
    return <Chip label={i18n._("Processing results")} color="warning"/>;
  } else if (marketStatus === 'WAITING_REGISTER_POINTS') {
    return <Chip label={i18n._("Prize distribution:")+' '+getTimeLeft(submissionPeriodEnd, false, locale)} color="warning" />;
  } else if (marketStatus === 'FINALIZED') {
    return <Chip label={i18n._("Finished")} color="success" />
  }

  return null;
}

export default MarketStatus;
