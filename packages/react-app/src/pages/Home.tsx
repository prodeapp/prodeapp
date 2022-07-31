import React, { useState } from "react";
import {useMarkets, UseMarketsProps} from "../hooks/useMarkets";
import CircularProgress from '@mui/material/CircularProgress';
import Alert from "@mui/material/Alert";
import HomeSlider from "../components/HomeSlider";
import MarketsFilter from "../components/MarketsFilter";
import MarketsTable from "../components/MarketsTable";

function Home() {
  const [marketFilters, setMarketFilters] = useState<UseMarketsProps>({});

  const { isLoading, error, data: markets } = useMarkets(marketFilters);

  return (
    <>
      <HomeSlider />

      <MarketsFilter setMarketFilters={setMarketFilters} />

      {isLoading && <CircularProgress />}

      {error && <Alert severity="error">{error.message}</Alert>}

      {!isLoading && !error && <MarketsTable markets={markets} />}
    </>
  );
}

export default Home;