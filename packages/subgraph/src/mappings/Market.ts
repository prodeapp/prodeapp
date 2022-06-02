import { log, BigInt, Address, dataSource } from '@graphprotocol/graph-ts';
import { BetReward, FundingReceived, ManagementReward, PlaceBet, QuestionsRegistered, Prizes, Market as MarketContract } from '../types/templates/Market/Market';
import { Realitio } from '../types/RealitioV3/Realitio';
import { Bet, Funder, Match, Market, MarketCuration } from '../types/schema';
import {getBetID, getOrCreateManager, getOrCreatePlayer, getOrCreateMarketCuration} from './helpers';
import { RealitioAddress } from './constants';

export function handleQuestionsRegistered(event: QuestionsRegistered): void {
    // Start indexing the market; `event.params.market` is the
    // address of the new market contract
    log.info("handleInitialize: Initializing {} market", [event.address.toHexString()])
    let context = dataSource.context()
    let hash = context.getString('hash')
    let marketContract = MarketContract.bind(event.address);
    let market = new Market(event.address.toHexString());
    market.name = marketContract.name();
    market.hash = hash;
    market.symbol = marketContract.symbol();
    market.uri = marketContract.baseURI();
    market.managementFee = marketContract.managementFee();
    market.closingTime = marketContract.closingTime();
    market.creationTime = event.block.timestamp;
    market.submissionTimeout = marketContract.submissionTimeout();
    market.price = marketContract.price();
    market.numOfMatchesWithAnswer = BigInt.fromI32(0);
    market.hasPendingAnswers = true;

    let manager = getOrCreateManager(marketContract.manager());
    market.manager = manager.id;

    let nonce = BigInt.fromI32(0);
    let realitioSC = Realitio.bind(Address.fromBytes(RealitioAddress));

    log.debug("handleQuestionsRegistered: Registering questions for market {}", [market.id.toString()])
    for (let i = 0; i < event.params._questionIDs.length; i++) {
        let questionID = event.params._questionIDs[i]
        let match = new Match(questionID.toHexString());
        match.market = market.id;
        match.questionID = questionID;
        match.nonce = nonce;
        match.openingTs = realitioSC.getOpeningTS(questionID);
        match.timeout = realitioSC.getTimeout(questionID);
        match.minBond = realitioSC.getMinBond(questionID);
        match.finalizeTs = realitioSC.getFinalizeTS(questionID);
        match.contentHash = realitioSC.getContentHash(questionID);
        match.historyHash = realitioSC.getHistoryHash(questionID);
        match.arbitrationOccurred = false;
        match.isPendingArbitration = false;
        match.save();
        nonce = nonce.plus(BigInt.fromI32(1))
        log.debug("handleQuestionsRegistered: matchID {} registered", [questionID.toHexString()])
    }
    market.numOfMatches = nonce;
    market.save();

    let marketCuration = getOrCreateMarketCuration(hash);
    let tmp_markets = marketCuration.markets;
    tmp_markets.push(market.id);
    marketCuration.markets = tmp_markets;
    marketCuration.save();
}

export function handlePrizesRegistered(event: Prizes): void {
    // Start indexing the market; `event.params.market` is the
    // address of the new market contract
    log.info("handlePrizesRegistered: {} market", [event.address.toHexString()])
    let market = Market.load(event.address.toHexString())!;
    market.prizes = event.params._prizes.map<BigInt>(prize => BigInt.fromI32(prize));
    market.save();
}

export function handlePlaceBet(event: PlaceBet): void {
    let market = Market.load(event.address.toHexString())!
    market.pool = market.pool.plus(market.price)
    market.save()

    let player = getOrCreatePlayer(event.params._player)
    
    if (!player.markets.includes(market.id)) {
        let tmp_markets = player.markets;
        tmp_markets.push(market.id);
        player.markets = tmp_markets;
        player.numOfMarkets = player.numOfMarkets.plus(BigInt.fromI32(1));
    }
    player.numOfBets = player.numOfBets.plus(BigInt.fromI32(1));
    player.amountBet = player.amountBet.plus(event.transaction.value)
    player.save()

    let betID = getBetID(event.address, event.params.tokenID)
    log.info("handlePlaceBet: Betid: {}", [betID.toString()])
    let bet = Bet.load(betID)
    if (bet == null) {
        bet = new Bet(betID)
        bet.tokenID = event.params.tokenID
        bet.hash = event.params._tokenHash
        bet.player = player.id
        bet.market = market.id
        bet.results = event.params._predictions
        bet.count = BigInt.fromI32(0)
        bet.points = BigInt.fromI32(0)
        bet.reward = BigInt.fromI32(0)
        bet.claim = false;
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

    let player = getOrCreatePlayer(Address.fromString(bet.player));
    player.pricesReceived = player.pricesReceived.plus(event.params._reward)
    player.save()
}

export function handleFundingReceived(event: FundingReceived): void {
    let market = Market.load(event.address.toHexString())!;
    market.pool = market.pool.plus(event.params._amount);
    market.save()

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
    let markets = funder.markets;
    markets.push(market.id)
    funder.markets = markets;
    funder.save()
    log.info("handleFundingReceived: {} funds received from {}", [event.params._amount.toString(), event.params._funder.toString()])
}


export function handleManagementReward(event: ManagementReward): void {
    let market = Market.load(event.address.toHexString())!;
    market.resultSubmissionPeriodStart = event.block.timestamp;
    market.save();

    let manager = getOrCreateManager(event.params._manager);
    manager.managementRewards = manager.managementRewards.plus(event.params._managementReward);
    manager.save()
}