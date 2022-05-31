import React from "react";
import {BoxWrapper, BoxRow} from "../components";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import {Link} from "react-router-dom";
import {useTournaments} from "../hooks/useTournaments";
import {Tournament} from "../graphql/subgraph";
import {formatAmount, getTimeLeft} from "../lib/helpers";

function Home() {
  const { isLoading, error, data: tournaments } = useTournaments();

  return (
    <>
      <BoxWrapper>
        <BoxRow style={{textAlign: 'right'}}>
          <Button component={Link} to="/tournaments/new">+ New Tournament</Button>
        </BoxRow>
      </BoxWrapper>

      {!isLoading && !error && tournaments && <TournamentsTable tournaments={tournaments}/>}
    </>
  );
}

type TournamentsTableProps = {
  tournaments: Tournament[]
}

function TournamentsTable({tournaments}: TournamentsTableProps) {
  return <BoxWrapper>
    <BoxRow>
      <Box sx={{width: {md: '25%'}, flexGrow: 1}}>Name</Box>
      <Box sx={{width: '130px', display: {xs: 'none', md: 'block'}}}>Bet Price</Box>
      <Box sx={{width: '130px', display: {xs: 'none', md: 'block'}}}>Prize Pool</Box>
      <Box sx={{width: '20%', display: {xs: 'none', md: 'block'}}}>Time Remaining</Box>
      <Box sx={{width: '5%', display: {xs: 'none', md: 'block'}}}>Verified?</Box>
    </BoxRow>
    {tournaments.map((tournament, i) => {
      return <BoxRow key={i}>
        <Box sx={{width: {md: '25%'}, flexGrow: 1}}>
          <Link to={`/tournaments/${tournament.id.toString()}`} style={{display: 'flex'}} key={i}>{tournament.name}</Link>

          <Box sx={{display: {md: 'none'}, fontWeight: 'normal', fontSize: '14px'}}>
            <div>Bet Price: {formatAmount(tournament.price)} / Prize Pool: {formatAmount(tournament.pool)}</div>
            <div>{getTimeLeft(tournament.closingTime)}</div>
          </Box>
        </Box>
        <Box sx={{width: '130px', display: {xs: 'none', md: 'block'}}}>{formatAmount(tournament.price)}</Box>
        <Box sx={{width: '130px', display: {xs: 'none', md: 'block'}}}>{formatAmount(tournament.pool)}</Box>
        <Box sx={{width: '20%', display: {xs: 'none', md: 'block'}}}>{getTimeLeft(tournament.closingTime)}</Box>
        <Box sx={{width: '5%', display: {xs: 'none', md: 'block'}}}>{tournament.curation.status === "Registered"? '✅' : '🚫'}</Box>
      </BoxRow>
    })}
  </BoxWrapper>
}

export default Home;