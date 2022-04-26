import React, {useEffect, useState} from "react";
import {Box, BoxRow} from "../index";
import Button from '@mui/material/Button';
import QuestionsDialog from "../../components/Questions/QuestionsDialog";
import {formatAmount, getTimeLeft} from "../../lib/helpers";
import {Tournament} from "../../graphql/subgraph";

export default function PlaceBet({tournament}: {tournament: Tournament}) {
  const [openModal, setOpenModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | false>(false);

  useEffect(() => {
    if (!tournament) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(tournament.closingTime, true))
    }, 1000);
    return () => clearInterval(interval);
  }, [tournament]);

  if (timeLeft === false) {
    return null;
  }

  const handleClose = () => {
    setOpenModal(false);
  };
  
  return <>
    <QuestionsDialog
      tournamentId={tournament.id}
      price={tournament.price}
      open={openModal}
      handleClose={handleClose}
    />
    <Box style={{padding: 20}}>
      <BoxRow>
        <div style={{textAlign: 'center', margin: '0 auto'}}>
          <div>Bet Price: {formatAmount(tournament.price)}</div>
          <Button style={{flexGrow: 0, margin: '15px 0'}} variant="outlined" size="large" onClick={() => setOpenModal(true)}>Place Bet</Button>
          <div style={{fontWeight: 'medium'}}>{timeLeft}</div>
        </div>
      </BoxRow>
    </Box>
  </>
}
