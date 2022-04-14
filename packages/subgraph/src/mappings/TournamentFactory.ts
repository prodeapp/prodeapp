import { Tournament } from '../../generated/templates'
import { NewTournament } from '../../generated/TournamentFactory/TournamentFactory'

export function handleNewTournament(event: NewTournament): void {
  // Start indexing the tournament; `event.params.tournament` is the
  // address of the new tournament contract
  Tournament.create(event.params.tournament)
}