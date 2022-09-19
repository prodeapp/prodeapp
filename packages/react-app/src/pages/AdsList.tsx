import React, { useState } from "react";
import {useAds, UseAdsProps} from "../hooks/useAds";
import CircularProgress from '@mui/material/CircularProgress';
import Alert from "@mui/material/Alert";
import Grid from '@mui/material/Grid';
import AdsFilter from "../components/AdsFilter";
import {Ad} from "../graphql/subgraph";
import {formatAmount} from "../lib/helpers";
import {Trans} from "@lingui/macro";
import Box from "@mui/material/Box";
import {MarketDetails, MarketsGrid} from "../components/MarketsTable";

function AdBox({ad}: {ad: Ad}) {
  return <Box sx={{display: 'flex', flexDirection: {xs: 'column', md: 'row'}, justifyContent: 'space-between'}}>
    <Box sx={{p: '24px', width: '100%'}}>
      <div style={{height: '95%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'center'}}>
        <div dangerouslySetInnerHTML={{__html: ad.svg}} style={{margin: '0 auto'}}></div>
      </div>
    </Box>
    <MarketDetails sx={{minWidth: {md: '245px'}}}>
      <div>
        <div><Trans>Total Bids</Trans></div>
        <div style={{fontWeight: 'bold'}}>{ad.bids.length}</div>
      </div>

      <div>
        <div><Trans>Highest Bid</Trans></div>
        <div style={{fontWeight: 'bold'}}>{formatAmount(0)}</div>
      </div>

      <div>
        <div><Trans>Lower Bid</Trans></div>
        <div style={{fontWeight: 'bold'}}>{formatAmount(0)}</div>
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