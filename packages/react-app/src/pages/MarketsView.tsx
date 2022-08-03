import React, {useEffect, useState} from "react";
import {useMarket} from "../hooks/useMarket";
import {useParams, useSearchParams} from "react-router-dom";
import {BoxWrapper, BoxRow} from "../components"
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import {getMarketUrl, getReferralKey, getTwitterShareUrl} from "../lib/helpers";
import Bets from "../components/MarketView/Bets";
import Results from "../components/MarketView/Results";
import PlaceBet from "../components/MarketView/PlaceBet";
import MarketStatus from "../components/MarketView/MarketStatus";
import {t, Trans} from "@lingui/macro";
import BetForm from "../components/Bet/BetForm";
import ReferralLink from "../components/MarketView/ReferralLink";
import { Stats } from "../components/MarketView/Stats";
import MarketCurateStatus from "../components/MarketView/MarketCurateStatus";
import {styled, useTheme} from "@mui/material/styles";
import MarketInfo from "../components/MarketView/MarketInfo";

const GridLeftColumn = styled(Grid)(({ theme }) => ({
  background: theme.palette.secondary.main,
  padding: '40px 25px',
}));

function MarketsView() {
  const { id } = useParams();
  const { isLoading, data: market } = useMarket(String(id));
  const [section, setSection] = useState<'bet'|'bets'|'results'|'stats'>('bets');
  const [searchParams] = useSearchParams();
  const theme = useTheme();

  useEffect(() => {
    const referralId = searchParams.get('referralId');

    if (referralId) {
      window.localStorage.setItem(getReferralKey(String(id)), referralId);
    }
  }, [searchParams, id]);

  if (isLoading) {
    return <div><Trans>Loading...</Trans></div>
  }

  if (!market) {
    return searchParams.get('new') === '1'
            ? <div><Trans>This market was just created, please wait a few seconds for it to be indexed.</Trans></div>
            : <div><Trans>Market not found</Trans></div>
  }

  const shareUrl = getTwitterShareUrl(t`Check this market on @prode_eth: ${market.name} ${getMarketUrl(market.id)}`)

  return (
    <>
      <Grid container spacing={0} style={{minHeight: '100%', borderTop: `1px solid ${theme.palette.black.dark}`}}>
        <GridLeftColumn item xs={12} md={4}>
          <div>
            <MarketStatus marketId={market.id} />
            <h2 style={{fontSize: '27.65px', marginTop: '10px'}}>{market.name}</h2>

            <Grid container spacing={0} style={{borderBottom: `1px solid ${theme.palette.black.dark}`, paddingBottom: '20px'}}>
              <Grid item xs={12} md={6} sx={{pr: 2}} style={{borderRight: `1px solid ${theme.palette.black.dark}`}}>
                <div>Market verification</div>
                <MarketCurateStatus marketHash={market.hash} marketId={market.id}/>
              </Grid>
              <Grid item xs={12} md={6} sx={{pl: 2}} style={{textAlign: 'right'}}>
                <div><a href={shareUrl} target="_blank" rel="noreferrer">Share on Twitter</a></div>
                <div>
                  <ReferralLink marketId={market.id}/>
                </div>
              </Grid>
            </Grid>

            {section !== 'bet' && <PlaceBet market={market} onClick={() => setSection('bet')}/>}
          </div>
        </GridLeftColumn>
        <Grid item xs={12} md={8}>
          <MarketInfo market={market} />

          <BoxWrapper>
            <BoxRow style={{justifyContent: 'center'}}>
              <div><Button onClick={() => setSection('bets')} color={section === 'bets' ? 'secondary' : 'primary'}><Trans>Bets</Trans></Button></div>
              <div><Button onClick={() => setSection('results')} color={section === 'results' ? 'secondary' : 'primary'}><Trans>Results</Trans></Button></div>
              <div><Button onClick={() => setSection('stats')} color={section === 'stats' ? 'secondary' : 'primary'}><Trans>Statistics</Trans></Button></div>
            </BoxRow>
          </BoxWrapper>

          {section === 'results' && <Results marketId={market.id} />}

          {section === 'bets' && <Bets marketId={market.id} />}

          {section === 'bet' && <BetForm marketId={market.id} price={market.price} />}

          {section === 'stats' && <Stats marketId={market.id} />}
        </Grid>
      </Grid>
    </>
  );
}

export default MarketsView;
