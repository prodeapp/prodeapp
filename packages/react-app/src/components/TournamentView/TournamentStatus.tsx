import React from "react";
import {useTournamentStatus} from "../../hooks/useTournamentStatus";

function TournamentStatus({tournamentId}: {tournamentId: string}) {
  const { data: tournamentStatus} = useTournamentStatus(String(tournamentId));

  if (tournamentStatus === '') {
    return null;
  }

  if (tournamentStatus === 'ACCEPTING_BETS') {
    return <span>Accepting bets</span>;
  } else if (tournamentStatus === 'WAITING_ANSWERS') {
    return <span>Waiting for results</span>;
  } else if (tournamentStatus === 'WAITING_REGISTER_POINTS' || tournamentStatus === 'WAITING_AVAILABITILY_OF_RESULTS') {
    return <span>Building ranking</span>;
  } else if (tournamentStatus === 'FINALIZED') {
    return <span>Finished</span>;
  }

  return <span></span>;
}

export default TournamentStatus;
