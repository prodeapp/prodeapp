import React from "react";
import Grid from '@mui/material/Grid';
import {formatAmount} from "../../lib/helpers";
import {DIVISOR} from "../../hooks/useMarketForm";
import {shortenAddress} from "@usedapp/core";
import {Trans} from "@lingui/macro";
import {styled} from "@mui/material/styles";
import {Market} from "../../graphql/subgraph";
import {Typography} from "@mui/material";
import {ReactComponent as MedalIcon} from "../../assets/icons/medal.svg";

function MarketInfo({market}: {market: Market}) {
  const GridStyled = styled(Grid)(({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.black.dark}`,
    '& > div': {
      padding: '20px 50px',
      '& > div:first-child': {
        marginBottom: '5px',
      },
    },
    '& > div + div': {
      borderLeft: `1px solid ${theme.palette.black.dark}`
    },
  }));

  const medalColors = [
    '#E0BC02',
    '#FF8788',
    '#B0B0B0',
  ]

  return <GridStyled container spacing={0}>
    <Grid item xs={6} md={3}>
      <Typography variant="p3" component="div"><Trans>Pool</Trans></Typography>
      <Typography variant="h4s" component="h4">{formatAmount(market.pool)}</Typography>
    </Grid>
    <Grid item xs={6} md={3}>
      <Typography variant="p3" component="div"><Trans>Prize Distribution</Trans></Typography>
      <div>
        {market.prizes.map((value, index) => {
          return <div style={{display: 'flex', alignItems: 'center'}} key={index}>
            <MedalIcon style={{margin: '0 10px 10px 0', fill: medalColors[index] || medalColors[2]}} />
            <Typography variant="h6s" component="h6" key={index}>{Number(value) * 100 / DIVISOR}%</Typography>
          </div>;
        })}
      </div>
    </Grid>
    <Grid item xs={6} md={3}>
      <Typography variant="p3" component="div"><Trans>Total Fee</Trans></Typography>
      <Typography variant="h4s" component="h4">{(Number(market.managementFee) + Number(market.protocolFee)) * 100 / DIVISOR}%</Typography>
    </Grid>
    <Grid item xs={6} md={3}>
      <Typography variant="p3" component="div"><Trans>Manager</Trans></Typography>
      <Typography variant="h4s" component="h4"><a href={`https://blockscout.com/xdai/mainnet/address/${market.manager.id}/transactions`} target="_blank" rel="noreferrer">{shortenAddress(market.manager.id)}</a></Typography>
    </Grid>
  </GridStyled>
}

export default MarketInfo;
