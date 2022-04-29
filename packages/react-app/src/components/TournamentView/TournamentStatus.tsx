import React from "react";
import {useTournamentStatus} from "../../hooks/useTournamentStatus";

function TournamentStatus({tournamentId}: {tournamentId: string}) {
  const { data: tournamentStatus} = useTournamentStatus(String(tournamentId));

  if (tournamentStatus === '') {
    return null;
  }

  if (tournamentStatus === 'ACCEPTING_BETS') {
    return <span>Accepting bets</span>;
  }

  if (tournamentStatus === 'WAITING_ANSWERS') {
    return <span>Waiting answers</span>;
  }

  return <span>Building ranking</span>;
}

export default TournamentStatus;
