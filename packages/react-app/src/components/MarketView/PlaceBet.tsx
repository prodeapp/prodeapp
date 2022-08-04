import React, {useEffect, useState} from "react";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import {formatAmount, getTimeLeft} from "../../lib/helpers";
import {Market} from "../../graphql/subgraph";
import { Trans } from "@lingui/macro";
import {useI18nContext} from "../../lib/I18nContext";
import { ReactComponent as CurrencyIcon } from "../../assets/icons/currency.svg";
import {Typography} from "@mui/material";
import {ReactComponent as ArrowRight} from "../../assets/icons/arrow-right-2.svg";

export default function PlaceBet({market, onClick}: {market: Market, onClick: () => void}) {
  const [timeLeft, setTimeLeft] = useState<string | false>(false);
  const { locale } = useI18nContext();

  useEffect(() => {
    if (!market) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(market.closingTime, true, locale))
    }, 1000);
    return () => clearInterval(interval);
  }, [market, locale]);

  if (timeLeft === false) {
    return null;
  }

  return <div style={{textAlign: 'center', margin: '0 auto'}}>
    <Box sx={{marginTop: '50px', marginBottom: {xs: '50px', md: '100px'}}}>
      <CurrencyIcon />
      <Typography variant="p3" component="div"><Trans>Bet Price:</Trans></Typography>
      <div style={{fontWeight: 'bold'}}>{formatAmount(market.price)}</div>
    </Box>

    <Typography variant="p3" component="div"><Trans>There's not much time left, hurry!</Trans></Typography>
    <div style={{fontWeight: 'bold', marginBottom: '15px'}}>{timeLeft}</div>
    <Button color="primary" size="large" fullWidth onClick={onClick}><Trans>Place Bet</Trans> - {formatAmount(market.price)} <ArrowRight style={{marginLeft: 10}}/></Button>
  </div>
}
