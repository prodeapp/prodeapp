import React from "react";
import {Link as RouterLink, useParams} from "react-router-dom";
import Grid from '@mui/material/Grid';
import { Trans } from '@lingui/react';
import {useBetToken} from "../hooks/useBetToken";
import {BigNumber} from "@ethersproject/bignumber";
import {useBet} from "../hooks/useBet";
import BetDetails from "../components/Bet/BetDetails";
import {Button} from "@mui/material";

function TokenView() {
  const { id, tokenId } = useParams();
  const { isLoading, data: bet } = useBet(String(id), String(tokenId));

  const {data: image = ''} = useBetToken(String(id), BigNumber.from(tokenId));

  if (isLoading) {
    return <div><Trans id="Loading..." /></div>
  }

  if (!bet) {
    return <Trans id="Bet not found" />
  }

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>

          {image && <div style={{textAlign: 'center'}}>
            <img src={image} style={{margin: '20px 0'}} alt="Bet NFT" />
          </div>}

          <div style={{textAlign: 'center', margin: '20px 0'}}>
            <Button component={RouterLink} to={`/markets/${id}`}><Trans id="Go to market" /></Button>
          </div>

          <BetDetails bet={bet} />
        </Grid>
      </Grid>
    </>
  );
}

export default TokenView;
