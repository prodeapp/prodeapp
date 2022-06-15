import { log, BigInt, Address, dataSource } from '@graphprotocol/graph-ts';
import { BetReward, FundingReceived, ManagementReward, PlaceBet, QuestionsRegistered, Prizes, Market as MarketContract } from '../types/templates/Market/Market';
import { Realitio } from '../types/RealitioV3/Realitio';
import { Bet, Funder, Event, Market } from '../types/schema';
import {getBetID, getOrCreateManager, getOrCreatePlayer, getOrCreateMarketCuration} from './helpers';
import { RealitioAddress } from './constants';

export function handleQuestionsRegistered(evt: QuestionsRegistered): void {
    // Start indexing the market; `event.params.market` is the
    // address of the new market contract
    log.info("handleInitialize: Initializing {} market", [evt.address.toHexString()])
    let context = dataSource.context()
    let hash = context.getString('hash')
    let marketContract = MarketContract.bind(evt.address);
    let market = new Market(evt.address.toHexString());
    market.name = marketContract.name();
    market.hash = hash;
    market.managementFee = marketContract.managementFee();
    market.closingTime = marketContract.closingTime();
    market.creationTime = evt.block.timestamp;
    market.submissionTimeout = marketContract.submissionTimeout();
    market.price = marketContract.price();
    market.numOfEventsWithAnswer = BigInt.fromI32(0);
    market.hasPendingAnswers = true;

    let manager = getOrCreateManager(marketContract.manager());
    market.manager = manager.id;

    let nonce = BigInt.fromI32(0);
    let realitioSC = Realitio.bind(Address.fromBytes(RealitioAddress));

    log.debug("handleQuestionsRegistered: Registering questions for market {}", [market.id.toString()])
    for (let i = 0; i < evt.params._questionIDs.length; i++) {
        let questionID = evt.params._questionIDs[i]
        let event = new Event(questionID.toHexString());
        event.market = market.id;
        event.questionID = questionID;
        event.nonce = nonce;
        event.openingTs = realitioSC.getOpeningTS(questionID);
        event.timeout = realitioSC.getTimeout(questionID);
        event.minBond = realitioSC.getMinBond(questionID);
        event.finalizeTs = realitioSC.getFinalizeTS(questionID);
        event.contentHash = realitioSC.getContentHash(questionID);
        event.historyHash = realitioSC.getHistoryHash(questionID);
        event.arbitrationOccurred = false;
        event.isPendingArbitration = false;
        event.save();
        nonce = nonce.plus(BigInt.fromI32(1))
        log.debug("handleQuestionsRegistered: eventID {} registered", [questionID.toHexString()])
    }
    market.numOfEvents = nonce;
    market.save();

    let marketCuration = getOrCreateMarketCuration(hash);
    let tmp_markets = marketCuration.markets;
    tmp_markets.push(market.id);
    marketCuration.markets = tmp_markets;
    marketCuration.save();
}

export function handlePrizesRegistered(evt: Prizes): void {
    // Start indexing the market; `event.params.market` is the
    // address of the new market contract
    log.info("handlePrizesRegistered: {} market", [evt.address.toHexString()])
    let market = Market.load(evt.address.toHexString())!;
    market.prizes = evt.params._prizes.map<BigInt>(prize => BigInt.fromI32(prize));
    market.save();
}

export function handlePlaceBet(evt: PlaceBet): void {
    let market = Market.load(evt.address.toHexString())!
    market.pool = market.pool.plus(market.price)
    market.save()

    let player = getOrCreatePlayer(evt.params._player)
    
    if (!player.markets.includes(market.id)) {
        let tmp_markets = player.markets;
        tmp_markets.push(market.id);
        player.markets = tmp_markets;
        player.numOfMarkets = player.numOfMarkets.plus(BigInt.fromI32(1));
    }
    player.numOfBets = player.numOfBets.plus(BigInt.fromI32(1));
    player.amountBet = player.amountBet.plus(evt.transaction.value)
    player.save()

    let betID = getBetID(evt.address, evt.params.tokenID)
    log.info("handlePlaceBet: Betid: {}", [betID.toString()])
    let bet = Bet.load(betID)
    if (bet == null) {
        bet = new Bet(betID)
        bet.tokenID = evt.params.tokenID
        bet.hash = evt.params._tokenHash
        bet.player = player.id
        bet.market = market.id
        bet.results = evt.params._predictions
        bet.count = BigInt.fromI32(0)
        bet.points = BigInt.fromI32(0)
        bet.reward = BigInt.fromI32(0)
        bet.claim = false;
        bet.reward = BigInt.fromI32(0)
    }
    bet.count = bet.count.plus(BigInt.fromI32(1))
    bet.save()
}

export function handleBetReward(evt: BetReward): void {
    let betID = getBetID(evt.address, evt.params._tokenID)
    log.info("handleBetReward: Betid: {}", [betID.toString()])
    let bet = Bet.load(betID)!
    bet.claim = true;
    bet.reward = evt.params._reward;
    bet.save()
    log.debug("handleBetReward: {} reward claimed from token {}", [evt.params._reward.toString(), evt.params._tokenID.toString()])

    let player = getOrCreatePlayer(Address.fromString(bet.player));
    player.pricesReceived = player.pricesReceived.plus(evt.params._reward)
    player.save()
}

export function handleFundingReceived(evt: FundingReceived): void {
    let market = Market.load(evt.address.toHexString())!;
    market.pool = market.pool.plus(evt.params._amount);
    market.save()

    let funder = Funder.load(evt.params._funder.toString())
    if (funder == null) funder = new Funder(evt.params._funder.toString())
    funder.amount = funder.amount.plus(evt.params._amount)
    let msgs = funder.messages
    if (msgs === null) {
        msgs = [evt.params._message];
    } else {
        msgs.push(evt.params._message);
    }
    funder.messages = msgs;
    let markets = funder.markets;
    markets.push(market.id)
    funder.markets = markets;
    funder.save()
    log.info("handleFundingReceived: {} funds received from {}", [evt.params._amount.toString(), evt.params._funder.toString()])
}


export function handleManagementReward(evt: ManagementReward): void {
    let market = Market.load(evt.address.toHexString())!;
    market.resultSubmissionPeriodStart = evt.block.timestamp;
    market.save();

    let manager = getOrCreateManager(evt.params._manager);
    manager.managementRewards = manager.managementRewards.plus(evt.params._managementReward);
    manager.save()
}