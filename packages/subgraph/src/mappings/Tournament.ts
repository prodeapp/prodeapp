import { log, BigInt, Address, Bytes } from '@graphprotocol/graph-ts';
import { BetReward, FundingReceived, Initialize, ManagementReward, PlaceBet, QuestionsRegistered} from '../types/templates/Tournament/Tournament';
import { Realitio } from '../types/RealitioV3/Realitio';
import { Bet, Funder, Match, Tournament } from '../types/schema';
import { getBetID, getMatchID, getOrCreateManager, getOrCreatePlayer } from './helpers';
import { RealitioAddress } from './constants';


export function handleInitialize(event: Initialize): void {
    // Start indexing the tournament; `event.params.tournament` is the
    // address of the new tournament contract
    log.info("handleInitialize: Initializing {} tournament", [event.address.toHexString()])
    let tournament = new Tournament(event.address.toHexString());
    tournament.name = event.params._name;
    tournament.symbol = event.params._symbol;
    tournament.uri = event.params._uri;
    tournament.managementFee = event.params._managementFee;
    tournament.closingTime = event.params._closingTime;
    tournament.creationTime = event.block.timestamp;
    tournament.price = event.params._price;
    tournament.owner = event.params._ownwer;
    tournament.period = BigInt.fromI32(1);
    tournament.numOfMatches = BigInt.fromI32(0);

    let manager = getOrCreateManager(event.params._manager);
    tournament.manager = manager.id;
    tournament.save()
    log.debug("handleInitialize: Tournament {} initialized.", [tournament.id.toString()]);
}

export function handleQuestionsRegistered(event: QuestionsRegistered): void {
    let tournament = Tournament.load(event.address.toHexString())!;
    let nonce = tournament.numOfMatches;
    let realitioSC = Realitio.bind(Address.fromBytes(RealitioAddress));

    log.debug("handleQuestionsRegistered: Registering questions for tournament {}", [tournament.id.toString()])
    for (let i = 0; i < event.params._questionIDs.length; i++) {
        let questionID = event.params._questionIDs[i]
        let matchID = getMatchID(event.address, nonce)
        let match = new Match(matchID);
        match.tournament = tournament.id;
        match.questionID = questionID;
        match.nonce = nonce;
        match.openingTs = realitioSC.getOpeningTS(questionID);
        match.timeout = realitioSC.getTimeout(questionID);
        match.minBond = realitioSC.getMinBond(questionID);
        match.finalizeTs = realitioSC.getFinalizeTS(questionID);
        match.contentHash = realitioSC.getContentHash(questionID);
        match.historyHash = realitioSC.getHistoryHash(questionID);
        match.save();
        nonce = nonce.plus(BigInt.fromI32(1))
        log.debug("handleQuestionsRegistered: matchID {} registered", [matchID])
    }
    tournament.numOfMatches = nonce;
    tournament.save();
}


export function handlePlaceBet(event: PlaceBet): void {
    let tournament = Tournament.load(event.address.toHexString())!
    tournament.pool = tournament.pool.plus(tournament.price)
    tournament.save()

    let player = getOrCreatePlayer(event.params._player)
    let tmp_tournaments = player.tournaments;
    tmp_tournaments.push(tournament.id);
    player.tournaments = tmp_tournaments;
    player.save()

    let betID = getBetID(event.address, event.params.tokenID)
    log.info("handlePlaceBet: Betid: {}", [betID.toString()])
    let bet = Bet.load(betID)
    if (bet == null) {
        bet = new Bet(betID)
        bet.tokenID = event.params.tokenID
        bet.player = player.id
        bet.tournament = tournament.id
        bet.results = event.params._predictions
        bet.count = BigInt.fromI32(0)
        bet.points = BigInt.fromI32(0)
        bet.reward = BigInt.fromI32(0)
        bet.claim = false;
        bet.ranking = BigInt.fromI32(0)
        bet.reward = BigInt.fromI32(0)
    }
    bet.count = bet.count.plus(BigInt.fromI32(1))
    bet.save()
}

export function handleBetReward(event: BetReward): void {
    let betID = getBetID(event.address, event.params._tokenID)
    log.info("handleBetReward: Betid: {}", [betID.toString()])
    let bet = Bet.load(betID)!
    bet.claim = true;
    bet.reward = event.params._reward;
    bet.save()
    log.debug("handleBetReward: {} reward claimed from token {}", [event.params._reward.toString(), event.params._tokenID.toString()])
}

export function handleFundingReceived(event: FundingReceived): void {
    let tournament = Tournament.load(event.address.toHexString())!;
    tournament.pool = tournament.pool.plus(event.params._amount);
    tournament.save()

    let funder = Funder.load(event.params._funder.toString())
    if (funder == null) funder = new Funder(event.params._funder.toString())
    funder.amount = funder.amount.plus(event.params._amount)
    let msgs = funder.messages
    if (msgs === null) {
        msgs = [event.params._message];
    } else {
        msgs.push(event.params._message);
    }
    funder.messages = msgs;
    let tournaments = funder.tournaments;
    tournaments.push(tournament.id)
    funder.tournaments = tournaments;
    funder.save()
    log.info("handleFundingReceived: {} funds received from {}", [event.params._amount.toString(), event.params._funder.toString()])
}


export function handleManagementReward(event: ManagementReward): void {
    let tournament = Tournament.load(event.address.toHexString())!;
    tournament.period = BigInt.fromI32(2);  // pass to next period
    log.debug("handleManagementReward: Moving tournament {} to period 2", [event.address.toHexString()]);
    let manager = getOrCreateManager(event.params._manager);
    manager.managementRewards = manager.managementRewards.plus(event.params._managementReward);
    manager.save()
}