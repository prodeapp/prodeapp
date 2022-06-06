import React, { useState } from "react";
import { BoxWrapper, BoxRow } from "../components";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { Link } from "react-router-dom";
import { useTournaments } from "../hooks/useTournaments";
import { Tournament } from "../graphql/subgraph";
import { formatAmount, getTimeLeft } from "../lib/helpers";
import { FormControlLabel, FormGroup, Grid, Switch, Typography } from "@mui/material";

function Home() {
  const [verifiedStatus, setVerifiedStatus] = useState<boolean>(false);
  const [activeStatus, setActiveStatus] = useState<boolean>(true);
  const [pendingStatus, setPendingStatus] = useState<boolean>(false);
  const [closedStatus, setClosedStatus] = useState<boolean>(false);
  const [closingTime_gt, setClosingTime_gt] = useState<string | undefined>(String(Date.now()));
  const [hasPendingAnswers, setHasPendingAnswers] = useState<boolean | undefined>(false);

  const { isLoading, error, data: tournaments } = useTournaments({
    curated: verifiedStatus ? verifiedStatus : undefined,
    hasPendingAnswers: hasPendingAnswers,
    closingTime_gt: closingTime_gt ? closingTime_gt : undefined
  });

  console.log(activeStatus, pendingStatus, closedStatus, closingTime_gt, hasPendingAnswers);
  function handleActiveStatus() {
    setClosingTime_gt(String(Date.now()));
    setHasPendingAnswers(undefined);
    setPendingStatus(false);
    setClosedStatus(false);
    setActiveStatus(true);

  };
  function handlePendingStatus() {
    setClosingTime_gt(undefined);
    setHasPendingAnswers(true);
    setClosedStatus(false);
    setActiveStatus(false);
    setPendingStatus(true);

  };
  function handleClosedStatus() {
    setClosingTime_gt(undefined);
    setHasPendingAnswers(false);
    setPendingStatus(false);
    setActiveStatus(false);
    setClosedStatus(true);
  };

  return (
    <>
      <BoxWrapper>
        <BoxRow style={{ textAlign: 'right' }}>
          <Button component={Link} to="/tournaments/new">+ New Tournament</Button>
        </BoxRow>
      </BoxWrapper>

      <BoxWrapper style={{padding:'15px'}}>
        <Grid container spacing={2}>
          <Grid item xs={8} style={{ display:'flex', justifyContent: 'center', width: '65%',  alignItems: 'center'}}>
            <div><Typography style={{paddingRight:'10px'}}>Markets by Status: </Typography></div>
            <div><Button onClick={handleActiveStatus} color={activeStatus ? 'secondary' : 'primary'}>Active</Button></div>
            <div><Button onClick={handlePendingStatus} color={pendingStatus ? 'secondary' : 'primary'}>Pending</Button></div>
            <div><Button onClick={handleClosedStatus} color={closedStatus ? 'secondary' : 'primary'}>Closed</Button></div>
          </Grid>
          <Grid item xs={4} style={{ justifyContent: 'right', width: '25%' }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={verifiedStatus}
                    onClick={() => setVerifiedStatus(!verifiedStatus)}
                  />}
                label="Only Verified tournaments" />
            </FormGroup>
          </Grid>
        </Grid>
      </BoxWrapper>

      {!isLoading && !error && tournaments && <TournamentsTable tournaments={tournaments} />}
    </>
  );
}

type TournamentsTableProps = {
  tournaments: Tournament[]
}

function TournamentsTable({ tournaments }: TournamentsTableProps) {
  return <BoxWrapper>
    <BoxRow>
      <Box sx={{ width: { md: '25%' }, flexGrow: 1 }}>Name</Box>
      <Box sx={{ width: '130px', display: { xs: 'none', md: 'block' } }}>Bet Price</Box>
      <Box sx={{ width: '130px', display: { xs: 'none', md: 'block' } }}>Prize Pool</Box>
      <Box sx={{ width: '20%', display: { xs: 'none', md: 'block' } }}>Time Remaining</Box>
      <Box sx={{ width: '5%', display: { xs: 'none', md: 'block' } }}>Verified</Box>
    </BoxRow>
    {tournaments.map((tournament, i) => {
      return <BoxRow key={i}>
        <Box sx={{ width: { md: '25%' }, flexGrow: 1 }}>
          <Link to={`/tournaments/${tournament.id.toString()}`} style={{ display: 'flex' }} key={i}>{tournament.name}</Link>

          <Box sx={{ display: { md: 'none' }, fontWeight: 'normal', fontSize: '14px' }}>
            <div>Bet Price: {formatAmount(tournament.price)} / Prize Pool: {formatAmount(tournament.pool)}</div>
            <div>{getTimeLeft(tournament.closingTime)}</div>
          </Box>
        </Box>
        <Box sx={{ width: '130px', display: { xs: 'none', md: 'block' } }}>{formatAmount(tournament.price)}</Box>
        <Box sx={{ width: '130px', display: { xs: 'none', md: 'block' } }}>{formatAmount(tournament.pool)}</Box>
        <Box sx={{ width: '20%', display: { xs: 'none', md: 'block' } }}>{getTimeLeft(tournament.closingTime)}</Box>
        <Box sx={{ width: '5%', display: { xs: 'none', md: 'block' } }}>{tournament.curated === true ? '✅' : '🚫'}</Box>
      </BoxRow>
    })}
  </BoxWrapper>
}

export default Home;