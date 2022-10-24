import React, {useContext} from "react";
import Box from '@mui/material/Box';
import {Trans} from '@lingui/macro';
import {GlobalContext} from "../lib/GlobalContext";
import Button from "@mui/material/Button";
import FiltersWrapper from "./FiltersWrapper";
import TextField from "@mui/material/TextField";
import {Link as RouterLink} from "react-router-dom";

function AdsFilter() {
  const {adsFilters: {market, setMarket}} = useContext(GlobalContext);

  const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
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
                defaultValue={market}
                style={{width: '100%'}}
                placeholder={`Market ID`}
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