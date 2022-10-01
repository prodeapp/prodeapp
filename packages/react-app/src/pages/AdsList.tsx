import React, {useContext} from "react";
import {useAds} from "../hooks/useAds";
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
import {Link as RouterLink} from "react-router-dom";
import Button from "@mui/material/Button";
import {AdImg} from "../components/ImgSvg";
import {BigNumber} from "@ethersproject/bignumber";
import {GlobalContext} from "../lib/GlobalContext";

function getBidsInfo(ad: SVGAd): {max: BigNumber, min: BigNumber} {
  const bids = ad.bids.map(bid => {
    return getBidBalance(bid)
  }).sort((a, b) => {
    return a.sub(b).lt(0) ? 1 : -1
  });

  if (bids.length > 0) {
    return {max: bids[0], min: bids[bids.length - 1]}
  }

  return {max: BigNumber.from(0), min: BigNumber.from(0)}
}

function AdBox({ad}: {ad: SVGAd}) {
  const svgAd = useSvgAd(ad.id);

  const {max: maxBid, min: minBid} = getBidsInfo(ad);

  return <Box sx={{display: 'flex', flexDirection: {xs: 'column', md: 'row'}, justifyContent: 'space-between'}}>
    <Box sx={{p: '24px', width: '100%'}}>
      <div style={{height: '95%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'center'}}>
        <div style={{margin: '0 auto'}}>
          <AdImg svg={svgAd} width={290} />
        </div>
      </div>
    </Box>
    <MarketDetails sx={{minWidth: {md: '245px'}}}>
      <div>
        <div><Trans>Total Bids</Trans></div>
        <div style={{fontWeight: 'bold'}}>{ad.bids.length}</div>
      </div>

      {ad.bids.length === 1 && <div>
        <div><Trans>Current Bid</Trans></div>
        <div style={{fontWeight: 'bold'}}>{formatAmount(maxBid)}</div>
      </div>}

      {ad.bids.length > 1 && <>
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
  const {adsFilters} = useContext(GlobalContext);

  const { isLoading, error, data: ads } = useAds(adsFilters.filters);

  return (
    <>
      <AdsFilter />

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