import React from "react";
import {Box, BoxRow, Button} from "../components";
import {Link} from "react-router-dom";
import {useTournaments} from "../hooks/useTournaments";
import {Tournament} from "../lib/types";
import {DecimalBigNumber} from "../lib/DecimalBigNumber";

function Home() {
  const { error, data: tournaments } = useTournaments();

  return (
    <>
      <Box>
        <BoxRow style={{textAlign: 'right'}}>
          <Button as={Link} to="/tournaments/new">+ New Tournament</Button>
        </BoxRow>
      </Box>

      {!error && tournaments && <TournamentsTable tournaments={tournaments}/>}
    </>
  );
}

type TournamentsTableProps = {
  tournaments: Tournament[]
}

function TournamentsTable({tournaments}: TournamentsTableProps) {
  return <Box>
    <BoxRow>
      <div style={{width: '25%'}}>Name</div>
      <div style={{width: '25%'}}>Price</div>
      <div style={{width: '25%'}}>Participants</div>
      <div style={{width: '25%'}}>Total Prize</div>
    </BoxRow>
    {tournaments.map((tournament, i) => {
      return <BoxRow key={i}>
        <div style={{width: '25%'}}>
          <Link to={`/tournaments/${tournament.id.toString()}`} style={{display: 'flex'}} key={i}>{tournament.name}</Link>
        </div>
        <div style={{width: '25%'}}>{new DecimalBigNumber(tournament.price,18).toString()}</div>
        <div style={{width: '25%'}}>{tournament.participants.toString()}</div>
        <div style={{width: '25%'}}>{new DecimalBigNumber(tournament.totalPrize,18).toString()}</div>
      </BoxRow>
    })}
  </Box>
}

export default Home;