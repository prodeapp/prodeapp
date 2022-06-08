import React, {useEffect, useState} from "react";
import {BoxWrapper, BoxRow} from "../index";
import Button from '@mui/material/Button';
import QuestionsDialog from "../../components/Questions/QuestionsDialog";
import {formatAmount, getTimeLeft} from "../../lib/helpers";
import {Market} from "../../graphql/subgraph";

export default function PlaceBet({market}: {market: Market}) {
  const [openModal, setOpenModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | false>(false);

  useEffect(() => {
    if (!market) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(market.closingTime, true))
    }, 1000);
    return () => clearInterval(interval);
  }, [market]);

  if (timeLeft === false) {
    return null;
  }

  const handleClose = () => {
    setOpenModal(false);
  };

  return <>
    <QuestionsDialog
      marketId={market.id}
      price={market.price}
      open={openModal}
      handleClose={handleClose}
    />
    <BoxWrapper style={{padding: 20}}>
      <BoxRow>
        <div style={{textAlign: 'center', margin: '0 auto'}}>
          <div>Bet Price: {formatAmount(market.price)}</div>
          <Button style={{flexGrow: 0, margin: '15px 0'}} color="secondary" variant="outlined" size="large" onClick={() => setOpenModal(true)}>Place Bet</Button>
          <div style={{fontWeight: 'medium'}}>{timeLeft}</div>
        </div>
      </BoxRow>
    </BoxWrapper>
  </>
}
