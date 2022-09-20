import React, {useContext, useEffect} from "react";
import Box from '@mui/material/Box';
import {UseAdsProps} from "../hooks/useAds";
import {Trans} from '@lingui/macro';
import {GlobalContext} from "../lib/GlobalContext";
import Button from "@mui/material/Button";
import FiltersWrapper from "./FiltersWrapper";
import TextField from "@mui/material/TextField";
import {Link as RouterLink} from "react-router-dom";

type AdsFilterProps = {
  setAdsFilters: (data: UseAdsProps) => void
}

function AdsFilter({setAdsFilters}: AdsFilterProps) {
  const {adsFilters} = useContext(GlobalContext);

  const {
    market, setMarket,
  } = adsFilters;

  const getAdsFilters = () => {
    return {
      market: market
    };
  }

  useEffect(() => {
    setAdsFilters(getAdsFilters());
  // eslint-disable-next-line
  }, []);

  const onChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarket(evt.target.value);
  }

  return (
    <div>
      <FiltersWrapper>
        <div className="filter-columns">
          <div>
            <div className="filter-label"><Trans>Market</Trans>:</div>
            <Box sx={{ display:'flex', justifyContent: 'center', alignItems: 'center'}}>
              <TextField
                onChange={onChange}
                style={{width: '100%'}}
                placeholder={`Market name`}
                size="small"
              />
            </Box>
          </div>
        </div>
        <div>
          <Box sx={{ display:'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Button component={RouterLink} to={`/ads/create`}>Submit ad</Button>
          </Box>
        </div>
      </FiltersWrapper>
    </div>
  );
}

export default AdsFilter;