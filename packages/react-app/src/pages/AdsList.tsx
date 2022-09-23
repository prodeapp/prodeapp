import React, {useEffect, useState} from "react";
import {useAds, UseAdsProps} from "../hooks/useAds";
import CircularProgress from '@mui/material/CircularProgress';
import Alert from "@mui/material/Alert";
import Grid from '@mui/material/Grid';
import AdsFilter from "../components/AdsFilter";
import {Base64Ad} from "../graphql/subgraph";
import {formatAmount} from "../lib/helpers";
import {Trans} from "@lingui/macro";
import Box from "@mui/material/Box";
import {MarketDetails, MarketsGrid} from "../components/MarketsTable";
import {useSvgAd} from "../hooks/useSvgAd";
import {BigNumber} from "@ethersproject/bignumber";
import {BigNumberish} from "ethers";

function AdBox({ad}: {ad: Base64Ad}) {
  const svgAd = useSvgAd(ad.id);
  const [maxBid, setMaxBid] = useState<BigNumberish>(0);
  const [minBid, setMinBid] = useState<BigNumberish>(0);

  useEffect(() => {
    const bids = ad.Bids.map(b => {
      const balance = BigNumber.from(b.balance).sub(
        BigNumber.from(b.bidPerSecond).mul(
          Math.round(Date.now() / 1000) - Number(b.startTimestamp)
        )
      );

      return balance.lt(0) ? BigNumber.from(0) : balance;
    }).sort((a, b) => {
      return a.sub(b).lt(0) ? 1 : -1
    });

    if (bids.length > 0) {
      setMaxBid(bids[0]);
      setMinBid(bids[bids.length - 1]);
    } else {
      setMaxBid(0);
      setMinBid(0);
    }
  }, [ad]);

  return <Box sx={{display: 'flex', flexDirection: {xs: 'column', md: 'row'}, justifyContent: 'space-between'}}>
    <Box sx={{p: '24px', width: '100%'}}>
      <div style={{height: '95%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'center'}}>
        <div dangerouslySetInnerHTML={{__html: svgAd}} style={{margin: '0 auto'}}></div>
      </div>
    </Box>
    <MarketDetails sx={{minWidth: {md: '245px'}}}>
      <div>
        <div><Trans>Total Bids</Trans></div>
        <div style={{fontWeight: 'bold'}}>{ad.Bids.length}</div>
      </div>

      {ad.Bids.length === 1 && <div>
        <div><Trans>Current Bid</Trans></div>
        <div style={{fontWeight: 'bold'}}>{formatAmount(maxBid)}</div>
      </div>}

      {ad.Bids.length > 1 && <>
        <div>
          <div><Trans>Highest Bid</Trans></div>
          <div style={{fontWeight: 'bold'}}>{formatAmount(maxBid)}</div>
        </div>

        <div>
          <div><Trans>Lower Bid</Trans></div>
          <div style={{fontWeight: 'bold'}}>{formatAmount(minBid)}</div>
        </div>
      </>}
    </MarketDetails>
  </Box>
}


function AdsList() {
  const [adFilters, setAdsFilters] = useState<UseAdsProps>({});

  const { isLoading, error, data: ads } = useAds(adFilters);

  return (
    <>
      <AdsFilter setAdsFilters={setAdsFilters} />

      {isLoading && <CircularProgress />}

      {error && <Alert severity="error">{error.message}</Alert>}

      {!isLoading && !error && <MarketsGrid container spacing={0}>
        {ads.map((ad, i) => {
          return <Grid item xs={12} md={6} key={i}>
            <AdBox ad={ad} />
          </Grid>
        })}
      </MarketsGrid>}
    </>
  );
}

export default AdsList;