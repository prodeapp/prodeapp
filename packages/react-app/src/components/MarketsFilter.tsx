import React, {useEffect, useState} from "react";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import {MarketStatus, UseMarketsProps} from "../hooks/useMarkets";
import {getFlattenedCategories} from "../lib/helpers";
import {FormControlLabel, FormGroup, MenuItem, Switch, Typography} from "@mui/material";
import TextField from "@mui/material/TextField";
import {Trans} from '@lingui/macro'
import {styled} from "@mui/material/styles";

const FiltersWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: theme.spacing(2),

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },

  '& > div': {
    [theme.breakpoints.down('md')]: {
      marginBottom: theme.spacing(2),
    }
  },
}));

type MarketsFilterProps = {
  setMarketFilters: (data: UseMarketsProps) => void
}

function MarketsFilter({setMarketFilters}: MarketsFilterProps) {
  const [verifiedStatus, setVerifiedStatus] = useState<boolean>(false);

  const [status, setStatus] = useState<MarketStatus | undefined>('active');
  const [category, setCategory] = useState('All');

  const changeStatus = (newStatus: MarketStatus) => {
    setStatus(newStatus === status ? undefined : newStatus)
  }

  const getMarketFilters= () => {
    return {
      curated: verifiedStatus ? verifiedStatus : undefined,
      status,
      category: category === 'All'? '' : category,
      minEvents: 3
    };
  }

  useEffect(() => {
    setMarketFilters(getMarketFilters());
  // eslint-disable-next-line
  }, [verifiedStatus, status, category]);

  useEffect(() => {
    setMarketFilters(getMarketFilters());
  // eslint-disable-next-line
  }, []);

  return (
    <FiltersWrapper>
      <Box sx={{ display: 'flex', flexDirection: {xs: 'column', md: 'row'}, justifyContent: 'center', alignItems: 'center'}}>
        <div><Typography style={{paddingRight:'10px'}}>Status: </Typography></div>
        <Box sx={{ display:'flex', justifyContent: 'center', alignItems: 'center'}}>
          <div><Button onClick={() => changeStatus('active')} color={status === 'active' ? 'primary' : 'secondary'}><Trans>Betting</Trans></Button></div>
          <div><Button onClick={() => changeStatus('pending')} color={status === 'pending' ? 'primary' : 'secondary'}><Trans>Playing</Trans></Button></div>
          <div><Button onClick={() => changeStatus('closed')} color={status === 'closed' ? 'primary' : 'secondary'}><Trans>Closed</Trans></Button></div>
        </Box>
      </Box>
      <Box sx={{ display:'flex', flexDirection: {xs: 'column', md: 'row'}, justifyContent: 'center', alignItems: 'center'}}>
        <div><Typography style={{paddingRight:'10px'}}><Trans>Category: </Trans></Typography></div>
        <TextField
          select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{width: '200px'}}>
          <MenuItem value="All"><Trans>All</Trans></MenuItem>
          {getFlattenedCategories().map(cat => <MenuItem value={cat.id} key={cat.id}>{cat.isChild ? `-- ${cat.text}` : cat.text}</MenuItem>)}
        </TextField>
      </Box>
      <Box sx={{ display:'flex', justifyContent: 'center', alignItems: 'center'}}>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={verifiedStatus}
                onClick={() => setVerifiedStatus(!verifiedStatus)}
              />}
            label={<Trans>Only verified markets</Trans>}/>
        </FormGroup>
      </Box>
    </FiltersWrapper>
  );
}

export default MarketsFilter;