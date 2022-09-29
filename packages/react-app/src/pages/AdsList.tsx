import React, {useEffect, useState} from "react";
import {useAds, UseAdsProps} from "../hooks/useAds";
import CircularProgress from '@mui/material/CircularProgress';
import Alert from "@mui/material/Alert";
import Grid from '@mui/material/Grid';
import AdsFilter from "../components/AdsFilter";
import {SVGAd} from "../graphql/subgraph";
import {formatAmount, getBidBalance} from "../lib/helpers";
import {Trans} from "@lingui/macro";
import Box from "@mui/material/Box";
import {MarketDetails, MarketsGrid} from "../components/MarketsTable";
import {useSvgAd} from "../hooks/useSvgAd";
import {BigNumberish} from "ethers";
import {Link as RouterLink} from "react-router-dom";
import Button from "@mui/material/Button";
import ImgSvg from "../components/ImgSvg";

function AdBox({ad}: {ad: SVGAd}) {
  const svgAd = useSvgAd(ad.id);
  const [maxBid, setMaxBid] = useState<BigNumberish>(0);
  const [minBid, setMinBid] = useState<BigNumberish>(0);

  useEffect(() => {
    const bids = ad.Bids.map(bid => {
      return getBidBalance(bid)
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
        <div style={{margin: '0 auto'}}>
          <ImgSvg svg={svgAd} width={290} />
        </div>
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

      <div>
        <Button component={RouterLink} to={`/ads/${ad.id}`} color={'primary'} fullWidth><Trans>See ad</Trans></Button>
      </div>
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