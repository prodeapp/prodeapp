import React from "react";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import {Link as RouterLink, Link} from "react-router-dom";
import { Market } from "../graphql/subgraph";
import {formatAmount, getTimeLeft} from "../lib/helpers";
import Alert from "@mui/material/Alert";
import {t, Trans} from '@lingui/macro'
import {useI18nContext} from "../lib/I18nContext";
import {styled} from "@mui/material/styles";

type MarketsTableProps = {
  markets?: Market[]
}

const MarketsGrid = styled(Grid)(({ theme }) => ({
  '.MuiGrid-item': {
    border: `1px solid ${theme.palette.black.dark}`,

    [theme.breakpoints.up('sm')]: {
      '&+.MuiGrid-item:nth-child(even)': {
        borderLeft: 'none',
      },
      '&+.MuiGrid-item:nth-child(n+3)': {
        borderTop: 'none',
      },
    },
  },
}));

const MarketDetails = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    borderLeft: `1px solid ${theme.palette.black.dark}`,
  },
  '>div': {
    padding: theme.spacing(2),

    '&:not(:last-child)': {
      borderBottom: `1px solid ${theme.palette.black.dark}`,
    }
  },
}));

function MarketsTable({ markets }: MarketsTableProps) {
  const { locale } = useI18nContext();

  if (!markets || markets.length === 0) {
    return <Alert severity="info"><Trans>No markets found.</Trans></Alert>
  }

  return <MarketsGrid container spacing={0}>
    {markets.map((market, i) => {
      const timeLeft = getTimeLeft(market.closingTime, false, locale);

      let status = <Chip label={t`Closed`} color="error" />;

      if (timeLeft !== false) {
        status = <Chip label={t`Betting`} color="success" />;
      } else if (market.hasPendingAnswers) {
        status = <Chip label={t`Playing`} color="warning" />;
      }

      return <Grid item xs={12} sm={6} key={i}>
        <Box sx={{display: 'flex', flexDirection: {xs: 'column', md: 'row'}, justifyContent: 'space-between'}}>
          <Box sx={{p: 2, paddingRight: {md: '15%'}}}>
            <div style={{height: '95%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
              <div>
                <div style={{fontWeight: 'normal', marginBottom: '5px'}}>{status}</div>
                <h2 style={{fontSize: '27.65px', marginTop: '20px'}}><Link to={`/markets/${market.id.toString()}`}>{market.name}</Link></h2>
              </div>
              {timeLeft && <div>
                <div style={{textAlign: 'center', marginBottom: 10, fontWeight: 700}}>{timeLeft}</div>
                <Button component={RouterLink} to={`/markets/${market.id.toString()}`} color={'primary'} fullWidth size="large"><Trans>Place Bet</Trans></Button>
              </div>}
            </div>
          </Box>
          <MarketDetails sx={{minWidth: {md: '245px'}}}>
            <div>
              <div style={{fontWeight: 'normal'}}><Trans>Bet price</Trans></div>
              <div>{formatAmount(market.price)}</div>
            </div>

            <div>
              <div style={{fontWeight: 'normal'}}><Trans>Pool prize</Trans></div>
              <div>{formatAmount(market.pool)}</div>
            </div>

            <div>
              <div style={{fontWeight: 'normal'}}><Trans>Participants</Trans></div>
              <div>{market.numOfBets}</div>
            </div>

            <div>
              <div style={{fontWeight: 'normal'}}><Trans>Verified</Trans></div>
              <div>{market.curated ? '✅' : '🚫'}</div>
            </div>
          </MarketDetails>
        </Box>
      </Grid>
    })}
  </MarketsGrid>
}

export default MarketsTable;