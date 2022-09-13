import React, { useState } from "react";
import {useAds, UseAdsProps} from "../hooks/useAds";
import CircularProgress from '@mui/material/CircularProgress';
import Alert from "@mui/material/Alert";
import Grid from '@mui/material/Grid';
import AdsFilter from "../components/AdsFilter";

function AdsList() {
  const [adFilters, setAdsFilters] = useState<UseAdsProps>({});

  const { isLoading, error, data: bids } = useAds(adFilters);

  return (
    <>
      <AdsFilter setAdsFilters={setAdsFilters} />

      {isLoading && <CircularProgress />}

      {error && <Alert severity="error">{error.message}</Alert>}

      {!isLoading && !error && <Grid container spacing={2}>
        {bids.map((bid, i) => {
          return <Grid item xs={12} md={6} key={i}>
            {JSON.stringify(bid)}
          </Grid>
        })}
      </Grid>}
    </>
  );
}

export default AdsList;