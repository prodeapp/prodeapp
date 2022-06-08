import React, { useState } from "react";
import { BoxWrapper, BoxRow } from "../components";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { Link } from "react-router-dom";
import {MarketStatus, useMarkets} from "../hooks/useMarkets";
import { Market } from "../graphql/subgraph";
import { formatAmount, getTimeLeft } from "../lib/helpers";
import { FormControlLabel, FormGroup, Grid, Switch, Typography } from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';
import Alert from "@mui/material/Alert";

function Home() {
  const [verifiedStatus, setVerifiedStatus] = useState<boolean>(false);

  const [status, setStatus] = useState<MarketStatus>('active');

  const { isLoading, error, data: markets } = useMarkets({
    curated: verifiedStatus ? verifiedStatus : undefined,
    status
  });

  return (
    <>
      <BoxWrapper>
        <BoxRow style={{ textAlign: 'right' }}>
          <Button component={Link} to="/markets/new">+ New Market</Button>
        </BoxRow>
      </BoxWrapper>

      <BoxWrapper style={{padding:'15px'}}>
        <Grid container spacing={2}>
          <Grid item xs={8} style={{ display:'flex', justifyContent: 'center', width: '65%',  alignItems: 'center'}}>
            <div><Typography style={{paddingRight:'10px'}}>Status: </Typography></div>
            <div><Button onClick={() => setStatus('active')} color={status === 'active' ? 'secondary' : 'primary'}>Active</Button></div>
            <div><Button onClick={() => setStatus('pending')} color={status === 'pending' ? 'secondary' : 'primary'}>Pending</Button></div>
            <div><Button onClick={() => setStatus('closed')} color={status === 'closed' ? 'secondary' : 'primary'}>Closed</Button></div>
          </Grid>
          <Grid item xs={4} style={{ justifyContent: 'right', width: '25%' }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={verifiedStatus}
                    onClick={() => setVerifiedStatus(!verifiedStatus)}
                  />}
                label="Only verified markets" />
            </FormGroup>
          </Grid>
        </Grid>
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
    return <Alert severity="info">No markets found.</Alert>
  }

  return <BoxWrapper>
    <BoxRow>
      <Box sx={{ width: { md: '25%' }, flexGrow: 1 }}>Name</Box>
      <Box sx={{ width: '130px', display: { xs: 'none', md: 'block' } }}>Bet Price</Box>
      <Box sx={{ width: '130px', display: { xs: 'none', md: 'block' } }}>Prize Pool</Box>
      <Box sx={{ width: '20%', display: { xs: 'none', md: 'block' } }}>{activeStatus? 'Time Remaining' : 'Pending answers'}</Box>
      <Box sx={{ width: '5%', display: { xs: 'none', md: 'block' } }}>Verified</Box>
    </BoxRow>
    {markets.map((market, i) => {
      return <BoxRow key={i}>
        <Box sx={{ width: { md: '25%' }, flexGrow: 1 }}>
          <Link to={`/markets/${market.id.toString()}`} style={{ display: 'flex' }} key={i}>{market.name}</Link>

          <Box sx={{ display: { md: 'none' }, fontWeight: 'normal', fontSize: '14px' }}>
            <div>Bet Price: {formatAmount(market.price)} / Prize Pool: {formatAmount(market.pool)}</div>
            <div>{getTimeLeft(market.closingTime)}</div>
          </Box>
        </Box>
        <Box sx={{ width: '130px', display: { xs: 'none', md: 'block' } }}>{formatAmount(market.price)}</Box>
        <Box sx={{ width: '130px', display: { xs: 'none', md: 'block' } }}>{formatAmount(market.pool)}</Box>
        <Box sx={{ width: '20%', display: { xs: 'none', md: 'block' } }}>{activeStatus? getTimeLeft(market.closingTime): market.numOfMatches - market.numOfMatchesWithAnswer}</Box>
        <Box sx={{ width: '5%', display: { xs: 'none', md: 'block' } }}>{market.curated ? '✅' : '🚫'}</Box>
      </BoxRow>
    })}
  </BoxWrapper>
}

export default Home;