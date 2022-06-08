import React, {useState} from "react";
import {useMarket} from "../hooks/useMarket";
import {Link as RouterLink, useParams, useSearchParams} from "react-router-dom";
import {BoxWrapper, BoxRow} from "../components"
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import {formatAmount} from "../lib/helpers";
import {DIVISOR} from "../components/MarketCreate/MarketForm";
import Ranking from "../components/MarketView/Ranking";
import Results from "../components/MarketView/Results";
import PlaceBet from "../components/MarketView/PlaceBet";
import {shortenAddress, useEthers} from "@usedapp/core";
import Alert from "@mui/material/Alert";
import MarketStatus from "../components/MarketView/MarketStatus";

function MarketsView() {
  const { id } = useParams();
  const { isLoading, data: market } = useMarket(String(id));
  const { account } = useEthers();
  const [section, setSection] = useState<'ranking'|'results'|'my-bets'>('ranking');
  const [searchParams] = useSearchParams();

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!market) {
    return searchParams.get('new') === '1'
            ? <div>This market was just created, please wait a few seconds for it to be indexed.</div>
            : <div>Market not found</div>
  }

  return (
    <>
      <Box sx={{display: {md: 'flex'}, marginBottom: '20px'}}>
        <Box sx={{width: {md: '49%'}, textAlign: 'center'}}>
          <BoxWrapper sx={{height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: {xs: 2, md: 0}}}>
            <div style={{fontSize: '25px', width: '100%'}}>{market.name}</div>
            <div style={{fontSize: '18px', width: '100%', marginTop: 15}}>
              Status: <MarketStatus marketId={market.id} />
            </div>
            <Box sx={{mt: 4}}>
              {!market.curated && <Button component={RouterLink} to={`/curate/submit/${market.id}`}>Verify Market</Button>}
              {market.curated && <div>Verified ✅</div>}
            </Box>
          </BoxWrapper>
        </Box>
        <Box sx={{width: {md: '49%'}, marginLeft: {md: '2%'}}}>
          <BoxWrapper sx={{height: '100%'}}>
            <BoxRow style={{display: 'flex'}}>
              <div style={{width: '50%'}}>Pool</div>
              <div style={{width: '50%'}}>{formatAmount(market.pool)}</div>
            </BoxRow>
            <BoxRow style={{display: 'flex'}}>
              <div style={{width: '50%'}}>Manager</div>
              <div style={{width: '50%'}}><a href={`https://blockscout.com/xdai/mainnet/address/${market.manager.id}/transactions`} target="_blank" rel="noreferrer">{shortenAddress(market.manager.id)}</a></div>
            </BoxRow>
            <BoxRow style={{display: 'flex'}}>
              <div style={{width: '50%'}}>Management Fee</div>
              <div style={{width: '50%'}}>{Number(market.managementFee) * 100 / DIVISOR}%</div>
            </BoxRow>
            <BoxRow style={{display: 'flex'}}>
              <div style={{width: '50%'}}>Prize Distribution</div>
              <div style={{width: '50%'}}>
                {market.prizes.map((value, index) => {
                  const prizeMedal = 
                    index === 0 ? `🥇` :
                    index === 1 ? `🥈` :
                    index === 2 ? `🥉` : `#${index+1}`;
                  return <div key={index}>{prizeMedal}: {Number(value) * 100 / DIVISOR}%</div>;
                })}
              </div>
            </BoxRow>
          </BoxWrapper>
        </Box>
      </Box>

      <PlaceBet market={market} />

      <BoxWrapper>
        <BoxRow style={{justifyContent: 'center'}}>
          <div><Button onClick={() => setSection('ranking')} color={section === 'ranking' ? 'secondary' : 'primary'}>Ranking</Button></div>
          <div><Button onClick={() => setSection('results')} color={section === 'results' ? 'secondary' : 'primary'}>Results</Button></div>
          <div><Button onClick={() => setSection('my-bets')} color={section === 'my-bets' ? 'secondary' : 'primary'}>My Bets</Button></div>
        </BoxRow>
      </BoxWrapper>

      {section === 'results' && <Results marketId={market.id} />}

      {section === 'ranking' && <Ranking marketId={market.id} />}

      {section === 'my-bets' && <>
        {account && <Ranking marketId={market.id} playerId={account} />}
        {!account && <Alert severity="error">Connect your wallet to see your bets.</Alert>}
      </>}
    </>
  );
}

export default MarketsView;
