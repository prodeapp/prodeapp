import React from "react";
import { Link } from "../components";
import {useTournaments} from "../hooks/useTournaments";
import {Tournament} from "../lib/types";
import {DecimalBigNumber} from "../lib/DecimalBigNumber";

function Home() {
  const { error, data: tournaments } = useTournaments();

  return (
    <>
      <Link to="/tournaments/new">New Tournament</Link>

      {!error && tournaments && <TournamentsTable tournaments={tournaments}/>}
    </>
  );
}

type TournamentsTableProps = {
  tournaments: Tournament[]
}

function TournamentsTable({tournaments}: TournamentsTableProps) {
  return <div style={{width: '90%'}}>
    <div style={{display: 'flex'}}>
      <div style={{width: '25%'}}>Name</div>
      <div style={{width: '25%'}}>Price</div>
      <div style={{width: '25%'}}>Participants</div>
      <div style={{width: '25%'}}>Total Prize</div>
    </div>
    {tournaments.map((tournament, i) => {
      return <Link to={`/tournaments/${tournament.id.toString()}`} style={{display: 'flex'}} key={i}>
        <div style={{width: '25%'}}>{tournament.name}</div>
        <div style={{width: '25%'}}>{new DecimalBigNumber(tournament.price,18).toString()}</div>
        <div style={{width: '25%'}}>{tournament.participants.toString()}</div>
        <div style={{width: '25%'}}>{new DecimalBigNumber(tournament.totalPrize,18).toString()}</div>
      </Link>
    })}
  </div>
}

export default Home;