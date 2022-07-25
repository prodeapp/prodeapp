import { Trans } from "@lingui/macro";
import { Button, Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import {Link as RouterLink} from "react-router-dom";
import { useCurateItem } from "../../hooks/useCurateItem";
import { useMarket } from "../../hooks/useMarket";


function MarketCurateStatus({marketId}: {marketId: string}) {
  const [marketHash, setMarketHash] = useState<string>('');
  const { data: marketData, error: errorMarketData} = useMarket(marketId);
  const { data: marketCurate, error} = useCurateItem(marketHash);

  useEffect(() => {
    if (marketData) {
      setMarketHash(marketData.hash);
    }
  }, [marketData])

  // console.log("MD", marketHash, marketData, marketCurate)

  if (error || errorMarketData ) return <></>;

  if (marketCurate === undefined || marketCurate.status === '') {
    return <Skeleton />;
  }
  
  if (marketCurate.status === 'Absent' || marketCurate === undefined) {
    return <Button component={RouterLink} to={`/curate/submit/${marketId}`}><Trans>Verify Market</Trans></Button>
  } else if (marketCurate.status === 'Registered') {
    return <div><Trans>Verified</Trans> ✅</div>;
  } else {
    return (
    <><Button component={RouterLink} to={`/curate/submit/${marketId}`}><Trans>Verify Market</Trans></Button>
    <div><Trans>Market under review. Check the submission and verify again if the current submission has a mistake.</Trans></div></>
    )
  }
}

export default MarketCurateStatus;
