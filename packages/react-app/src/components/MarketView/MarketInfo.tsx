import React from "react";
import Grid from '@mui/material/Grid';
import {formatAmount, getMedalColor} from "../../lib/helpers";
import {DIVISOR} from "../../hooks/useMarketForm";
import {shortenAddress} from "@usedapp/core";
import {Trans} from "../Trans";
import {styled} from "@mui/material/styles";
import {Market} from "../../graphql/subgraph";
import {Typography} from "@mui/material";
import {ReactComponent as MedalIcon} from "../../assets/icons/medal.svg";

const MANAGER_ADDRESS: Record<string, string> = {
  '0x64ab34d8cb33f8b8bb3d4b38426896297a3e7f81': 'UBI Burner',
  '0xa3954b4adb7caca9c188c325cf9f2991abb3cf71': 'UBI Burner',
  '0x0029ec18568f96afe25ea289dac6c4703868924d': 'Protocol Treasury',
  '0xbca74372c17597fa9da905c7c2b530766768027c': 'Protocol Treasury',
}

function MarketInfo({market}: {market: Market}) {
  const GridStyled = styled(Grid)(({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.black.dark}`,
    '& > div': {
      padding: '10px 20px',
      [theme.breakpoints.up('md')]: {
        padding: '20px 40px',
      },
      '& > div:first-of-type': {
        marginBottom: '5px',
      },
    },
    [theme.breakpoints.up('md')]: {
      '& > div + div': {
        borderLeft: `1px solid ${theme.palette.black.dark}`
      },
    },
  }));

  return <GridStyled container spacing={0}>
    <Grid item xs={6} md={3}>
      <Typography variant="p3" component="div"><Trans>Prize Pool</Trans></Typography>
      <Typography variant="h3" component="h3">{formatAmount(market.pool)}</Typography>
    </Grid>
    <Grid item xs={6} md={3}>
      <Typography variant="p3" component="div"><Trans>Prize Distribution</Trans></Typography>
      <div>
        {market.prizes.map((value, index) => {
          return <div style={{display: 'flex', alignItems: 'center'}} key={index}>
            <MedalIcon style={{margin: '0 10px 10px 0', fill: getMedalColor(index + 1)}} />
            <Typography variant="h6s" component="h6" key={index}>{Number(value) * 100 / DIVISOR}%</Typography>
          </div>;
        })}
      </div>
    </Grid>
    <Grid item xs={6} md={3}>
      <Typography variant="p3" component="div"><Trans>Fee</Trans></Typography>
      <Typography variant="h6s" component="h6">{(Number(market.managementFee) + Number(market.protocolFee)) * 100 / DIVISOR}%</Typography>
      <div style={{fontSize: '11.11px'}}>{Number(market.protocolFee) * 100 / DIVISOR}% protocol + {Number(market.managementFee) * 100 / DIVISOR}% manager</div>
    </Grid>
    <Grid item xs={6} md={3}>
      <Typography variant="p3" component="div"><Trans>Manager</Trans></Typography>
      <Typography variant="h6s" component="h6">
        <a href={`https://blockscout.com/xdai/mainnet/address/${market.manager.id}/transactions`} target="_blank" rel="noreferrer">
          {MANAGER_ADDRESS[market.manager.id.toLowerCase()] || shortenAddress(market.manager.id)}
        </a>
      </Typography>
    </Grid>
  </GridStyled>
}

export default MarketInfo;
