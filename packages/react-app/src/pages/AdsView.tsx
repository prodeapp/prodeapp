import React, {useMemo, useState} from "react";
import {useParams} from "react-router-dom";
import Grid from '@mui/material/Grid';
import {Trans} from "@lingui/macro";
import {styled, useTheme} from "@mui/material/styles";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import {TableHeader, TableBody} from "../components"
import {useAd} from "../hooks/useAd";
import {useSvgAd} from "../hooks/useSvgAd";
import {AdBid} from "../graphql/subgraph";
import {formatAmount, getBidBalance, getMedalColor} from "../lib/helpers";
import Typography from "@mui/material/Typography";
import PlaceBidDialog from "../components/Ads/PlaceBidDialog";
import ImgSvg from "../components/ImgSvg";
import {ReactComponent as MedalIcon} from "../assets/icons/medal.svg";
import {shortenAddress, useContractFunction, useEthers} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {FirstPriceAuction__factory} from "../typechain";

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

const firstPriceAuctionContract = new Contract(process.env.REACT_APP_FIRST_PRICE_AUCTION as string, FirstPriceAuction__factory.createInterface());

function AdsView() {
  const { id } = useParams();
  const { isLoading, data: ad } = useAd(String(id));
  const groupedBids = useIndexedBids(ad?.Bids);
  const svgAd = useSvgAd(String(id));
  const theme = useTheme();
  const [openModal, setOpenModal] = useState(false);
  const [marketToBid, setMarketToBid] = useState('');
  const {account} = useEthers();

  const { state: removeBidState, send: removeBid } = useContractFunction(firstPriceAuctionContract, 'removeBid');

  const handleClose = () => {
    setMarketToBid('');
    setOpenModal(false);
  }

  const handleOpen = (market: string) => {
    setMarketToBid(market);
    setOpenModal(true);
  }

  if (isLoading) {
    return <div><Trans>Loading...</Trans></div>
  }

  if (!ad) {
    return <div><Trans>Ad not found</Trans></div>
  }

  const itemId = ad?.curateSVGAdItem?.id;

  const handleRemove = (itemId: string, marketId: string) => {
    return async () => {
      await removeBid(
        itemId,
        marketId
      )

      // TODO: remove bid from react-query cache
    }
  }

  return (
    <>
      {itemId && <PlaceBidDialog
        open={openModal}
        handleClose={handleClose}
        itemId={itemId}
        market={marketToBid}
      />}
      <Grid container spacing={0} style={{minHeight: '100%', borderTop: `1px solid ${theme.palette.black.dark}`}}>
        <GridLeftColumn item xs={12} lg={4}>
          <div style={{textAlign: 'center'}}>
            <ImgSvg svg={svgAd} width={290} />

            <div style={{marginTop: '20px'}}>
              <Button color="primary" onClick={() => handleOpen('')}>Place new bid</Button>
            </div>
          </div>
        </GridLeftColumn>
        <Grid item xs={12} lg={8} sx={{p: 3}}>
          {removeBidState.status === 'Success' && <Alert severity="success"><Trans>Bid removed.</Trans></Alert>}
          {removeBidState.errorMessage && <Alert severity="error">{removeBidState.errorMessage}</Alert>}
          {groupedBids.length === 0 && <Alert severity="info"><Trans>No bids found.</Trans></Alert>}
          {groupedBids.map((bidInfo, i) => {
            return <Box key={i} sx={{my: 3}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                <div>
                  <Typography variant="h6">{bidInfo.market.name}</Typography>
                </div>
                <div>
                  <Button color="primary" size="small" onClick={() => handleOpen(bidInfo.market.id)}>Place bid</Button>
                </div>
              </div>
              <TableHeader>
                <div style={{width: '25%'}}>Bidder</div>
                <div style={{width: '25%'}}>Bid per second</div>
                <div style={{width: '25%'}}>Balance</div>
                <div style={{width: '25%'}}></div>
              </TableHeader>

                {bidInfo.bids.map((bid, j) => {
                  return <TableBody key={j}>
                    <div style={{width: '25%'}}>{shortenAddress(bid.bidder)}</div>
                    <div style={{width: '25%'}}>
                      {formatAmount(bid.bidPerSecond)}
                      {bid.currentHighest && !bid.removed && <MedalIcon style={{marginLeft: '10px', fill: getMedalColor(1)}} />}
                    </div>
                    <div style={{width: '25%'}}>{formatAmount(getBidBalance(bid))}</div>
                    <div style={{width: '25%'}}>
                      {account?.toLowerCase() === bid.bidder.toLowerCase() && itemId && <>
                        {!bid.removed && <Button color="primary" variant="outlined" size="small" onClick={handleRemove(itemId, bid.market.id)}>Remove</Button>}
                        <Button color="primary" variant="outlined" size="small" onClick={() => handleOpen(bidInfo.market.id)}>Update</Button>
                      </>}
                    </div>
                  </TableBody>
                })}
            </Box>
          })}
        </Grid>
      </Grid>
    </>
  );
}

export default AdsView;