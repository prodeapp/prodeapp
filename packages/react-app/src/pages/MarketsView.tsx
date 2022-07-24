import React, {useEffect, useState} from "react";
import {useMarket} from "../hooks/useMarket";
import {Link as RouterLink, useParams, useSearchParams} from "react-router-dom";
import {BoxWrapper, BoxRow} from "../components"
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import {formatAmount, getReferralKey} from "../lib/helpers";
import {DIVISOR} from "../hooks/useMarketForm";
import Bets from "../components/MarketView/Bets";
import Results from "../components/MarketView/Results";
import PlaceBet from "../components/MarketView/PlaceBet";
import {shortenAddress} from "@usedapp/core";
import MarketStatus from "../components/MarketView/MarketStatus";
import { Trans } from "@lingui/macro";
import BetForm from "../components/Bet/BetForm";
import ReferralLink from "../components/MarketView/ReferralLink";
import { Stats } from "../components/MarketView/Stats";

function MarketsView() {
  const { id } = useParams();
  const { isLoading, data: market } = useMarket(String(id));
  const [section, setSection] = useState<'bet'|'bets'|'results'|'stats'>('bets');
  const [searchParams] = useSearchParams();

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

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Box sx={{textAlign: 'center'}}>
            <BoxWrapper sx={{height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 2}}>
              <div style={{fontSize: '25px', width: '100%'}}>{market.name}</div>
              <div style={{fontSize: '18px', width: '100%', marginTop: 15}}>
                <Trans>Status: <MarketStatus marketId={market.id} /></Trans>
              </div>
              <Box sx={{mt: 4}}>
                {!market.curated && <Button component={RouterLink} to={`/curate/submit/${market.id}`}><Trans>Verify Market</Trans></Button>}
                {market.curated && <div><Trans>Verified</Trans> ✅</div>}
              </Box>
              <Box sx={{mt: 4}}>
                <ReferralLink marketId={market.id}/>
              </Box>
            </BoxWrapper>

            {section !== 'bet' && <PlaceBet market={market} onClick={() => setSection('bet')}/>}
          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          <Box sx={{marginBottom: '20px'}}>
            <BoxWrapper sx={{padding: 2}}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <div style={{marginBottom: 10}}><Trans>Pool</Trans></div>
                  <div>{formatAmount(market.pool)}</div>
                </Grid>
                <Grid item xs={6} md={3}>
                  <div style={{marginBottom: 10}}><Trans>Prize Distribution</Trans></div>
                  <div>
                    {market.prizes.map((value, index) => {
                      const prizeMedal =
                        index === 0 ? `🥇` :
                          index === 1 ? `🥈` :
                            index === 2 ? `🥉` : `#${index+1}`;
                      return <div key={index}>{prizeMedal}: {Number(value) * 100 / DIVISOR}%</div>;
                    })}
                  </div>
                </Grid>
                <Grid item xs={6} md={3}>
                  <div style={{marginBottom: 10}}><Trans>Management Fee</Trans></div>
                  <div>{Number(market.managementFee) * 100 / DIVISOR}%</div>
                </Grid>
                <Grid item xs={6} md={3}>
                  <div style={{marginBottom: 10}}><Trans>Manager</Trans></div>
                  <div><a href={`https://blockscout.com/xdai/mainnet/address/${market.manager.id}/transactions`} target="_blank" rel="noreferrer">{shortenAddress(market.manager.id)}</a></div>
                </Grid>
              </Grid>
            </BoxWrapper>
          </Box>

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
