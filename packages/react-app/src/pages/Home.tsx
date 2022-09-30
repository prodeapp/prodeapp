import React, {useContext} from "react";
import {useMarkets} from "../hooks/useMarkets";
import CircularProgress from '@mui/material/CircularProgress';
import Alert from "@mui/material/Alert";
import HomeSlider from "../components/HomeSlider";
import MarketsFilter from "../components/MarketsFilter";
import MarketsTable from "../components/MarketsTable";
import {GlobalContext} from "../lib/GlobalContext";

function Home() {
  const {marketFilters} = useContext(GlobalContext);
  const { isLoading, error, data: markets } = useMarkets(marketFilters.filters);

  return (
    <>
      <HomeSlider />

      <MarketsFilter />

      {isLoading && <CircularProgress />}

      {error && <Alert severity="error">{error.message}</Alert>}

      {!isLoading && !error && <MarketsTable markets={markets} />}
    </>
  );
}

export default Home;