import { log } from '@graphprotocol/graph-ts'
import { Tournament } from '../types/templates'
import { NewTournament } from '../types/TournamentFactory/TournamentFactory'

export function handleNewTournament(event: NewTournament): void {
  // Start indexing the tournament; `event.params.tournament` is the
  // address of the new tournament contract
  Tournament.create(event.params.tournament);
  log.info("handleNewTournament: {}", [event.params.tournament.toHexString()])
}