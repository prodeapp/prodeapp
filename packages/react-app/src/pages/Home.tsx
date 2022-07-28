import React, { useState } from "react";
import { BoxWrapper } from "../components";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import {Link as RouterLink, Link} from "react-router-dom";
import {MarketStatus, useMarkets} from "../hooks/useMarkets";
import { Market } from "../graphql/subgraph";
import {formatAmount, getFlattenedCategories, getTimeLeft} from "../lib/helpers";
import {FormControlLabel, FormGroup, MenuItem, Switch, Typography} from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import {t, Trans} from '@lingui/macro'
import {useI18nContext} from "../lib/I18nContext";
import HomeSlider from "../components/HomeSlider";
import {styled} from "@mui/material/styles";

const FiltersWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },

  // eslint-disable-next-line
  ['& > div']: {
    [theme.breakpoints.down('md')]: {
      marginBottom: theme.spacing(2),
    }
  },
}));


function Home() {
  const [verifiedStatus, setVerifiedStatus] = useState<boolean>(false);

  const [status, setStatus] = useState<MarketStatus | undefined>('active');
  const [category, setCategory] = useState('All');

  const { isLoading, error, data: markets } = useMarkets({
    curated: verifiedStatus ? verifiedStatus : undefined,
    status,
    category: category === 'All'? '' : category,
    minEvents: 3
  });

  const changeStatus = (newStatus: MarketStatus) => {
    setStatus(newStatus === status ? undefined : newStatus)
  }

  return (
    <>
      <HomeSlider />

      <BoxWrapper style={{padding:'15px'}}>
        <FiltersWrapper>
          <Box sx={{ display: 'flex', flexDirection: {xs: 'column', md: 'row'}, justifyContent: 'center', alignItems: 'center'}}>
            <div><Typography style={{paddingRight:'10px'}}>Status: </Typography></div>
            <Box sx={{ display:'flex', justifyContent: 'center', alignItems: 'center'}}>
              <div><Button onClick={() => changeStatus('active')} color={status === 'active' ? 'secondary' : 'primary'}><Trans>Betting</Trans></Button></div>
              <div><Button onClick={() => changeStatus('pending')} color={status === 'pending' ? 'secondary' : 'primary'}><Trans>Playing</Trans></Button></div>
              <div><Button onClick={() => changeStatus('closed')} color={status === 'closed' ? 'secondary' : 'primary'}><Trans>Closed</Trans></Button></div>
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
  const { locale } = useI18nContext();

  if (!markets || markets.length === 0) {
    return <Alert severity="info"><Trans>No markets found.</Trans></Alert>
  }

  return <Grid container spacing={0}>
    {markets.map((market, i) => {
      const timeLeft = getTimeLeft(market.closingTime, false, locale);

      let status = <Chip label={t`Closed`} color="error" />;

      if (timeLeft !== false) {
        status = <Chip label={t`Active`} color="success" />;
      } else if (market.hasPendingAnswers) {
        status = <Chip label={t`Pending`} color="warning" />;
      }

      return <Grid item xs={12} sm={6} key={i}>
        <Box sx={{display: 'flex', flexDirection: {xs: 'column', md: 'row'}, justifyContent: 'space-between', border: '1px solid #272727'}}>
          <Box sx={{p: 2}}>
            <div style={{height: '95%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
              <div>
                <div style={{fontWeight: 'normal', marginBottom: '5px'}}>{status}</div>
                <Link to={`/markets/${market.id.toString()}`} style={{ display: 'flex', fontSize: '24px', marginTop: '20px' }}>{market.name}</Link>
              </div>
              {timeLeft && <div>
                <div style={{textAlign: 'center', marginBottom: 10}}>{timeLeft}</div>
                <Button component={RouterLink} to={`/markets/${market.id.toString()}`} color={'secondary'} fullWidth><Trans>Place Bet</Trans></Button>
              </div>}
            </div>
          </Box>
          <Box sx={{minWidth: {md: '245px'}, borderLeft: '1px solid #272727'}}>
            <Box sx={{ p: 2, borderBottom: '1px solid #272727' }}>
              <div style={{fontWeight: 'normal'}}><Trans>Bet price</Trans></div>
              <div>{formatAmount(market.price)}</div>
            </Box>

            <Box sx={{ p: 2, borderBottom: '1px solid #272727' }}>
              <div style={{fontWeight: 'normal'}}><Trans>Pool prize</Trans></div>
              <div>{formatAmount(market.pool)}</div>
            </Box>

            <Box sx={{ p: 2, borderBottom: '1px solid #272727' }}>
              <div style={{fontWeight: 'normal'}}><Trans>Participants</Trans></div>
              <div>{market.numOfBets}</div>
            </Box>

            <Box sx={{p: 2}}>
              <div style={{fontWeight: 'normal'}}><Trans>Verified</Trans></div>
              <div>{market.curated ? '✅' : '🚫'}</div>
            </Box>
          </Box>
        </Box>
      </Grid>
    })}
  </Grid>
}

export default Home;