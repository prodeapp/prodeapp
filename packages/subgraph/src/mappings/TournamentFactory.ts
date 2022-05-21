import { DataSourceContext, log } from '@graphprotocol/graph-ts'
import { Tournament } from '../types/templates'
import { NewTournament } from '../types/TournamentFactory/TournamentFactory'

export function handleNewTournament(event: NewTournament): void {
  // Start indexing the tournament; `event.params.tournament` is the
  // address of the new tournament contract
  let context = new DataSourceContext()
  context.setString('hash', event.params.hash.toHexString())
  Tournament.createWithContext(event.params.tournament, context);
  log.info("handleNewTournament: {}", [event.params.tournament.toHexString()])
}