import React, { useState } from "react";
import { BoxWrapper } from "../components";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import {Link as RouterLink, Link} from "react-router-dom";
import {MarketStatus, useMarkets} from "../hooks/useMarkets";
import { Market } from "../graphql/subgraph";
import {formatAmount, getTimeLeft, MARKET_CATEGORIES} from "../lib/helpers";
import {FormControlLabel, FormGroup, MenuItem, Switch, Typography} from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';
import Alert from "@mui/material/Alert";
import {BigNumber} from "@ethersproject/bignumber";
import TextField from "@mui/material/TextField";
import { Trans } from '@lingui/macro'

function Home() {
  const [verifiedStatus, setVerifiedStatus] = useState<boolean>(false);

  const [status, setStatus] = useState<MarketStatus | undefined>('active');
  const [category, setCategory] = useState('All');

  const { isLoading, error, data: markets } = useMarkets({
    curated: verifiedStatus ? verifiedStatus : undefined,
    status,
    category: category === 'All'? '' : category
  });

  const changeStatus = (newStatus: MarketStatus) => {
    setStatus(newStatus === status ? undefined : newStatus)
  }

  return (
    <>
      <BoxWrapper style={{padding:'15px'}}>
        <Box sx={{display: 'flex', flexDirection: {xs: 'column', md: 'row'}, justifyContent: 'space-between'}}>
          <Box sx={{ display:'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div><Typography style={{paddingRight:'10px'}}>Status: </Typography></div>
            <div><Button onClick={() => changeStatus('active')} color={status === 'active' ? 'secondary' : 'primary'}><Trans>Active</Trans></Button></div>
            <div><Button onClick={() => changeStatus('pending')} color={status === 'pending' ? 'secondary' : 'primary'}><Trans>Pending</Trans></Button></div>
            <div><Button onClick={() => changeStatus('closed')} color={status === 'closed' ? 'secondary' : 'primary'}><Trans>Closed</Trans></Button></div>
          </Box>
          <Box sx={{ display:'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div><Typography style={{paddingRight:'10px'}}><Trans>Category: </Trans></Typography></div>
            <TextField
              select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{width: '200px'}}>
              <MenuItem value="All">All</MenuItem>
              {MARKET_CATEGORIES.map((category, i) => <MenuItem value={category.id} key={i}>{category.text}</MenuItem>)}
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
                label="Only verified markets" />
            </FormGroup>
          </Box>
        </Box>
      </BoxWrapper>

      {isLoading && <CircularProgress />}

      {error && <Alert severity="error">{error.message}</Alert>}

      {!isLoading && !error && <MarketsTable markets={markets} activeStatus={status === 'active'}/>}
    </>
  );
}

type MarketsTableProps = {
  markets?: Market[]
  activeStatus: boolean
}

function MarketsTable({ markets, activeStatus }: MarketsTableProps) {

  if (!markets || markets.length === 0) {
    return <Alert severity="info"><Trans>No markets found.</Trans></Alert>
  }

  return <Grid container spacing={2}>
    {markets.map((market, i) => {
      const timeLeft = getTimeLeft(market.closingTime);

      let status = <Trans>Closed</Trans>;

      if (timeLeft !== false) {
        status = <Trans>Active</Trans>;
      } else if (market.hasPendingAnswers) {
        status = <Trans>Pending</Trans>;
      }

      return <Grid item xs={12} sm={6} md={4} key={i}>
        <BoxWrapper style={{height: '100%', padding: '15px', boxSizing: 'border-box', marginBottom: 0}}>

          <Box sx={{display: 'flex', flexDirection: {xs: 'column', md: 'row'}, justifyContent: 'space-between'}}>
            <Box sx={{width: {md: '47%'}}}>
              <div style={{height: '95%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                <div>
                  <div style={{fontWeight: 'normal', marginBottom: '5px'}}>{status}</div>
                  <Link to={`/markets/${market.id.toString()}`} style={{ display: 'flex', fontSize: '24px' }}>{market.name}</Link>
                </div>
                {timeLeft && <div>
                  <div style={{textAlign: 'center', marginBottom: 10}}>{timeLeft}</div>
                  <Button component={RouterLink} to={`/markets/${market.id.toString()}`} color={'secondary'} fullWidth><Trans>Place Bet</Trans></Button>
                </div>}
              </div>
            </Box>
            <Box sx={{width: {md: '47%'}}}>
              <Box sx={{ mb: 3 }}>
                <div style={{fontWeight: 'normal'}}><Trans>Bet price</Trans></div>
                <div>{formatAmount(market.price)}</div>
              </Box>

              <Box sx={{ mb: 3 }}>
                <div style={{fontWeight: 'normal'}}><Trans>Pool prize</Trans></div>
                <div>{formatAmount(market.pool)}</div>
              </Box>

              <Box sx={{ mb: 3 }}>
                <div style={{fontWeight: 'normal'}}><Trans>Participants</Trans></div>
                <div>{BigNumber.from(market.pool).div(market.price).toString()}</div>
              </Box>

              <Box>
                <div style={{fontWeight: 'normal'}}><Trans>Verified</Trans></div>
                <div>{market.curated ? '✅' : '🚫'}</div>
              </Box>
            </Box>
          </Box>
        </BoxWrapper>
      </Grid>
    })}
  </Grid>
}

export default Home;