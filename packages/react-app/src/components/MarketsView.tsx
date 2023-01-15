import React, {useEffect, useState} from "react";
import {useMarket} from "../hooks/useMarket";
import {useParams, useSearchParams} from "react-router-dom";
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import {getMarketUrl, getReferralKey, getTwitterShareUrl} from "../lib/helpers";
import Bets from "../components/MarketView/Bets";
import Results from "../components/MarketView/Results";
import PlaceBet from "../components/MarketView/PlaceBet";
import MarketStatus from "../components/MarketView/MarketStatus";
import {t, Trans} from "../components/Trans";
import BetForm from "../components/Bet/BetForm";
import ReferralLink from "../components/MarketView/ReferralLink";
import { Stats } from "../components/MarketView/Stats";
import MarketCurateStatus from "../components/MarketView/MarketCurateStatus";
import {styled, useTheme} from "@mui/material/styles";
import MarketInfo from "../components/MarketView/MarketInfo";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {ReactComponent as TwitterIcon} from "../assets/icons/twitter.svg";
import Button from "@mui/material/Button";
import {ReactComponent as ArrowRightIcon} from "../assets/icons/arrow-right.svg";
import {FormControlLabel, FormGroup, Switch} from "@mui/material";
import { useEthers} from "@usedapp/core";
import DeleteMarket from "../components/MarketView/DeleteMarket";

const GridLeftColumn = styled(Grid)(({ theme }) => ({
  background: theme.palette.secondary.main,
  padding: '40px 25px',
}));

function a11yProps(index: number) {
  return {
    id: `market-tab-${index}`,
    'aria-controls': `market-tabpanel-${index}`,
  };
}

type MarketSections = 'bet'|'bets'|'results'|'stats';

function MarketsView() {
  const { id } = useParams();
  const { isLoading, data: market } = useMarket(String(id));
  const [section, setSection] = useState<MarketSections>('bets');
  const [searchParams] = useSearchParams();
  const [onlyMyBets, setOnlyMyBets] = useState(false);
  const theme = useTheme();
  const {account} = useEthers();

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

  const handleChange = (event: React.SyntheticEvent, newValue: MarketSections) => {
    setSection(newValue);
  };

  return (
    <>
      <Grid container spacing={0} style={{minHeight: '100%', borderTop: `1px solid ${theme.palette.black.dark}`}}>
        <GridLeftColumn item xs={12} lg={4}>
          <div>
            <MarketStatus marketId={market.id} />
            <h2 style={{fontSize: '27.65px', marginTop: '10px'}}>{market.name}</h2>

            {account?.toLowerCase() === market.creator && market.pool === '0' && <div style={{marginBottom: '20px'}}>
              <DeleteMarket marketId={market.id} />
            </div>}

            <Grid container spacing={0} style={{borderBottom: `1px solid ${theme.palette.black.dark}`, fontSize: '14px', paddingBottom: '20px'}}>
              <Grid item xs={6} md={6} sx={{pr: 2}} style={{borderRight: `1px solid ${theme.palette.black.dark}`}}>
                <div style={{fontWeight: 600, marginBottom: 5}}><Trans>Market verification</Trans>:</div>
                <MarketCurateStatus marketHash={market.hash} marketId={market.id}/>
              </Grid>
              <Grid item xs={6} md={6} sx={{pl: 2}}>
                <div style={{marginBottom: 5}}><a href={shareUrl} target="_blank" rel="noreferrer"><TwitterIcon /> <Trans>Share on Twitter</Trans></a></div>
                <div>
                  <ReferralLink marketId={market.id}/>
                </div>
              </Grid>
            </Grid>

            {section !== 'bet' && <PlaceBet market={market} onBetClick={() => setSection('bet')} onResultsClick={() => setSection('results')}/>}
          </div>
        </GridLeftColumn>
        <Grid item xs={12} lg={8}>
          {section !== 'bet' && <>
            <MarketInfo market={market} />

            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <Tabs value={section} onChange={handleChange} aria-label="Market sections" sx={{marginLeft: '20px'}}>
                <Tab label={t`Bets`} value="bets" {...a11yProps(0)} />
                <Tab label={t`Results`} value="results" {...a11yProps(1)} />
                <Tab label={t`Statistics`} value="stats" {...a11yProps(2)} />
              </Tabs>
              {account && section === 'bets' && <div>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={onlyMyBets}
                        onClick={() => setOnlyMyBets(!onlyMyBets)}
                      />}
                    label={<span style={{fontSize: '14px'}}><Trans>See only my bets</Trans></span>}/>
                </FormGroup>
              </div>}
            </div>

            {section === 'results' && <Results marketId={market.id} />}

            {section === 'bets' && <Bets marketId={market.id} onlyMyBets={onlyMyBets} />}

            {section === 'stats' && <Stats marketId={market.id} />}
          </>}

          {section === 'bet' && <Box sx={{mx: {md: 17}, mb: 10}}>
            <Button variant="text" onClick={() => setSection('bets')} sx={{margin: {xs: '10px 0', md: '40px 0'}, fontSize: '16px'}}>
              <ArrowRightIcon style={{marginRight: 10, transform: 'rotate(180deg)'}}/> Return to the market
            </Button>
            <BetForm market={market} cancelHandler={() => setSection('bets')}/>
          </Box>}
        </Grid>
      </Grid>
    </>
  );
}

export default MarketsView;
