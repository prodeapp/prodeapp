import { log, BigInt } from '@graphprotocol/graph-ts';
import { Initialize, PlaceBet, QuestionsRegistered } from '../types/templates/Tournament/Tournament';
import { Bet, Match, Tournament } from '../types/schema';
import { getBetID, getMatchID, getOrCreatePlayer } from './helpers';
import { PlayCircleOutlineRounded } from '@material-ui/icons';

export function handleInitialize(event: Initialize): void {
    // Start indexing the tournament; `event.params.tournament` is the
    // address of the new tournament contract
    let tournament = Tournament.load(event.transaction.to.toString());
    tournament.name = event.params._name;
    tournament.symbol = event.params._symbol;
    tournament.uri = event.params._uri;
    tournament.managementFee = event.params._managementFee;
    tournament.manager = event.params._manager;
    tournament.closingTime = event.params._closingTime;
    tournament.creationTime = event.block.timestamp;
    tournament.price = event.params._price;
    tournament.ownwer = event.params._ownwer;
    tournament.save()
    log.debug("handleInitialize: Tournament {} initialized.", [tournament.id.toString()]);
}

export function handleQuestionsRegistered(event: QuestionsRegistered) {
    let tournament = Tournament.load(event.address.toString());
    log.debug("handleQuestionsRegistered: Registering questions for tournament {}", [tournament.id.toString()])
    for (let i = 0; i < event.params._questionIDs.length; i++) {
        let matchID = getMatchID(event.address, event.params._questionIDs[i])
        let match = new Match(matchID);
        match.tournament = tournament.id;
        match.save();
        log.debug("handleQuestionsRegistered: matchID {} registered", [matchID])
    }
}


export function handlePlaceBet(event: PlaceBet) {
    let player = getOrCreatePlayer(event.params._player)
    let tournament = Tournament.load(event.address.toString())
    let tmp_tournamnets = player.tournaments
    tmp_tournamnets.push(tournament.id)
    player.tournaments = tmp_tournamnets

    let betID = getBetID(event.address, event.params.tokenID)
    let bet = Bet.load(betID)
    if (bet == null) {
        let bet = new Bet(betID)
        bet.tokenID = event.params.tokenID
        bet.player = player.id
        bet.tournament = tournament.id
        let predictions = event.params._predictions
        let results: BigInt[]
        for (let i = 0; i < predictions.length; i++) {
            results.push(BigInt.fromByteArray(predictions[i]))
        }
        bet.results = results
        bet.count = BigInt.fromI32(0)
    
    }
    bet.count = bet.count.plus(BigInt.fromI32(1))  
    bet.save()

    player.save()
}