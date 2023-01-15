import {t} from "../Trans";
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
    return <Chip label={t`Accepting bets`} color="success" />
  } else if (marketStatus === 'WAITING_ANSWERS') {
    return <Chip label={t`Waiting for results`} color="warning"/>;
  } else if (marketStatus === 'WAITING_AVAILABITILY_OF_RESULTS') {
    return <Chip label={t`Processing results`} color="warning"/>;
  } else if (marketStatus === 'WAITING_REGISTER_POINTS') {
    return <Chip label={t`Prize distribution:`+' '+getTimeLeft(submissionPeriodEnd, false, locale)} color="warning" />;
  } else if (marketStatus === 'FINALIZED') {
    return <Chip label={t`Finished`} color="success" />
  }

  return null;
}

export default MarketStatus;
