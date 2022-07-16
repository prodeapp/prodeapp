import React, {useEffect, useState} from "react";
import {BoxWrapper, BoxRow} from "../index";
import Button from '@mui/material/Button';
import {formatAmount, getTimeLeft} from "../../lib/helpers";
import {Market} from "../../graphql/subgraph";
import { Trans } from "@lingui/macro";

export default function PlaceBet({market, onClick}: {market: Market, onClick: () => void}) {
  const [timeLeft, setTimeLeft] = useState<string | false>(false);

  useEffect(() => {
    if (!market) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(market.closingTime, true))
    }, 1000);
    return () => clearInterval(interval);
  }, [market]);

  if (timeLeft === false) {
    return null;
  }

  return <>
    <BoxWrapper style={{padding: 20}}>
      <BoxRow>
        <div style={{textAlign: 'center', margin: '0 auto'}}>
          <div><Trans>Bet Price:</Trans> {formatAmount(market.price)}</div>
          <Button style={{flexGrow: 0, margin: '15px 0'}} color="secondary" variant="outlined" size="large" onClick={onClick}><Trans>Place Bet</Trans></Button>
          <div style={{fontWeight: 'medium'}}>{timeLeft}</div>
        </div>
      </BoxRow>
    </BoxWrapper>
  </>
}
