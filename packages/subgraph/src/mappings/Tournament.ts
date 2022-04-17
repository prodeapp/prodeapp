import { log, BigInt } from '@graphprotocol/graph-ts';
import { BetReward, FundingReceived, Initialize, NewPeriod, PlaceBet, QuestionsRegistered } from '../types/templates/Tournament/Tournament';
import { Bet, Funder, Match, Tournament } from '../types/schema';
import { getBetID, getOrCreatePlayer, tournamentPeriods } from './helpers';

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
    tournament.period = tournamentPeriods[0]
    tournament.save()
    log.debug("handleInitialize: Tournament {} initialized.", [tournament.id.toString()]);
}

export function handleQuestionsRegistered(event: QuestionsRegistered) {
    let tournament = Tournament.load(event.address.toString());
    log.debug("handleQuestionsRegistered: Registering questions for tournament {}", [tournament.id.toString()])
    for (let i = 0; i < event.params._questionIDs.length; i++) {
        let matchID = event.params._questionIDs[i].toString()
        let match = new Match(matchID);
        match.tournament = tournament.id;
        match.save();
        log.debug("handleQuestionsRegistered: matchID {} registered", [matchID])
    }
}


export function handlePlaceBet(event: PlaceBet) {
    let player = getOrCreatePlayer(event.params._player)
    let tournament = Tournament.load(event.address.toString())
    tournament.pool = tournament.pool.plus(tournament.price)
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
        bet.points = BigInt.fromI32(0)
        bet.reward = BigInt.fromI32(0)
        bet.claim = false;
    }
    bet.count = bet.count.plus(BigInt.fromI32(1))  
    bet.save()

    player.save()
}

export function handleBetReward(event: BetReward) {
    let betID = getBetID(event.address, event.params._tokenID)
    let bet = Bet.load(betID)
    bet.claim = true;
    bet.reward = event.params._reward;
    bet.save()
}

export function handleFundingReceived(event: FundingReceived) {
    let tournament = Tournament.load(event.address.toString());
    tournament.pool = tournament.pool.plus(event.params._amount);
    tournament.save()

    let funder = Funder.load(event.params._funder.toString())
    if (funder == null) funder = new Funder(event.params._funder.toString())
    funder.amount = funder.amount.plus(event.params._amount)
    let msgs = funder.messages
    msgs.push(event.params._message)
    funder.messages = msgs;
    let tournaments = funder.tournaments;
    tournaments.push(tournament.id)
    funder.tournaments = tournaments;
    funder.save()
}

export function handleNewPeriod(event: NewPeriod) {
    let period = tournamentPeriods[event.params._period.toI32()];
    let tournament = Tournament.load(event.address.toString());
    tournament.period = period;
    tournament.save();
}
