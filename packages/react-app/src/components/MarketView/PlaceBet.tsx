import React, {useEffect, useState} from "react";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import {betsClosingSoon, formatAmount, getTimeLeft} from "../../lib/helpers";
import {Market} from "../../graphql/subgraph";
import { Trans, Plural } from "@lingui/macro";
import {useI18nContext} from "../../lib/I18nContext";
import { ReactComponent as CurrencyIcon } from "../../assets/icons/currency.svg";
import {Typography} from "@mui/material";
import {ReactComponent as ArrowRight} from "../../assets/icons/arrow-right-2.svg";

export default function PlaceBet({market, onBetClick, onResultsClick}: {market: Market, onBetClick: () => void, onResultsClick: () => void}) {
  const [timeLeft, setTimeLeft] = useState<string | false>(false);
  const { locale } = useI18nContext();

  useEffect(() => {
    // to prevent initial flickering
    setTimeLeft(getTimeLeft(market.closingTime, true, locale))

    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(market.closingTime, true, locale))
    }, 1000);
    return () => clearInterval(interval);
  }, [market, locale]);

  return <div style={{textAlign: 'center', margin: '0 auto'}}>
    <Box sx={{marginTop: '50px', marginBottom: {xs: '50px', md: '100px'}}}>
      <CurrencyIcon />
      <Typography variant="p3" component="div"><Trans>Bet Price:</Trans></Typography>
      <div style={{fontWeight: 'bold'}}>{formatAmount(market.price)}</div>
    </Box>

    {timeLeft !== false && <>
      {betsClosingSoon(Number(market.closingTime)) && <Typography variant="p3" component="div"><Trans>There's not much time left, hurry!</Trans></Typography>}
      <div style={{fontWeight: 'bold', marginBottom: '15px'}}>{timeLeft}</div>
      <Button color="primary" size="large" fullWidth onClick={onBetClick}><Trans>Place Bet</Trans> - {formatAmount(market.price)} <ArrowRight style={{marginLeft: 10}}/></Button>
    </>}

    {timeLeft === false && market.hasPendingAnswers && <>
        <div style={{fontWeight: 'bold', marginBottom: '15px'}}>
          <Plural
            value={Number(market.numOfEvents) - Number(market.numOfEventsWithAnswer)}
            one="# result left to answer"
            other="# results left to answer"></Plural>
        </div>
      <Button color="primary" size="large" fullWidth onClick={onResultsClick}><Trans>Answer results</Trans> <ArrowRight style={{marginLeft: 10}}/></Button>
    </>}
  </div>
}
