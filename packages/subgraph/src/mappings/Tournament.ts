import { log } from '@graphprotocol/graph-ts';
import { Initialize } from '../../generated/templates/Tournament/Tournament';
import { Tournament } from '../../generated/schema';

export function handleInitialize(event: Initialize): void {
    // Start indexing the tournament; `event.params.tournament` is the
    // address of the new tournament contract
    let tournament = Tournament.load(event.transaction.to.toString());
    tournament.name = event.params.name;
    tournament.symbol = event.params.symbol;
    tournament.uri = event.params.uri;
    tournament.managementFee = event.params.managementFee;
    tournament.manager = event.params.manager;
    tournament.closingTime = event.params.closingTime;
    tournament.creationTime = event.block.timestamp;
    tournament.price = event.params.price;
    tournament.ownwer = event.params.ownwer;
    tournament.save()
    log.debug("handleInitialize: Tournament {} initialized.", [tournament.id.toString()]);
}