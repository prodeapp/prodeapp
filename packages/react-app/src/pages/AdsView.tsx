import React, {useMemo} from "react";
import {useParams} from "react-router-dom";
import Grid from '@mui/material/Grid';
import {Trans} from "@lingui/macro";
import {styled, useTheme} from "@mui/material/styles";
import Button from "@mui/material/Button";
import {TableHeader, TableBody} from "../components"
import { useEthers} from "@usedapp/core";
import {useAd} from "../hooks/useAd";
import {useSvgAd} from "../hooks/useSvgAd";
import {AdBid} from "../graphql/subgraph";
import {formatAmount, getBidBalance} from "../lib/helpers";
import Typography from "@mui/material/Typography";

const GridLeftColumn = styled(Grid)(({ theme }) => ({
  background: theme.palette.secondary.main,
  padding: '40px 25px',
}));

export function useIndexedBids(bids?: AdBid[]) {
  return useMemo(() => {
    const res: Record<string, {market: AdBid['market'], bids: AdBid[]}> = {};

    bids?.forEach(bid => {
      if (!res[bid.market.id]) {
        res[bid.market.id] = {
          market: bid.market,
          bids: []
        }
      }

      res[bid.market.id].bids.push(bid);
    })

    return Object.values(res);
  }, [bids])
}

function AdsView() {
  const { id } = useParams();
  const { isLoading, data: ad } = useAd(String(id));
  const groupedBids = useIndexedBids(ad?.Bids);
  const svgAd = useSvgAd(String(id));
  const theme = useTheme();
  const {account} = useEthers();

  if (isLoading) {
    return <div><Trans>Loading...</Trans></div>
  }

  if (!ad) {
    return <div><Trans>Ad not found</Trans></div>
  }

  return (
    <>
      <Grid container spacing={0} style={{minHeight: '100%', borderTop: `1px solid ${theme.palette.black.dark}`}}>
        <GridLeftColumn item xs={12} lg={4}>
          <div>
            <div dangerouslySetInnerHTML={{__html: svgAd}} style={{textAlign: 'center'}}></div>
          </div>
        </GridLeftColumn>
        <Grid item xs={12} lg={8} sx={{p: 3}}>
          {groupedBids.map((bidInfo, i) => {
            return <div key={i}>
              <Typography variant="h6">{bidInfo.market.name}</Typography>
              <TableHeader>
                <div style={{width: '33%'}}>Bidder</div>
                <div style={{width: '33%'}}>Bid per second</div>
                <div style={{width: '33%'}}>Balance</div>
              </TableHeader>

                {bidInfo.bids.map((bid, j) => {
                  return <TableBody key={j}>
                    <div style={{width: '33%'}}>{bid.bidder}</div>
                    <div style={{width: '33%'}}>{formatAmount(bid.bidPerSecond)}</div>
                    <div style={{width: '33%'}}>{formatAmount(getBidBalance(bid))}</div>
                  </TableBody>
                })}

            </div>
          })}
        </Grid>
      </Grid>
    </>
  );
}

export default AdsView;