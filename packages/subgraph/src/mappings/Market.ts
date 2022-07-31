import { log, BigInt, Address, dataSource } from '@graphprotocol/graph-ts';
import { BetReward, FundingReceived, ManagementReward, PlaceBet, QuestionsRegistered, Prizes, Market as MarketContract, Attribution as AttributionEvent, Transfer, RankingUpdated } from '../types/templates/Market/Market';
import { Manager as ManagerContract } from '../types/templates/Market/Manager'
import { Bet, Funder, Event, Market, Attribution } from '../types/schema';
import {getBetID, getOrCreateManager, getOrCreatePlayer, getOrCreateMarketCuration, getOrCreateMarketFactory} from './utils/helpers';

export function handleQuestionsRegistered(evt: QuestionsRegistered): void {
    // Start indexing the market; `event.params.market` is the
    // address of the new market contract
    log.info("handleInitialize: Initializing {} market", [evt.address.toHexString()])
    let context = dataSource.context()
    let hash = context.getString('hash')
    let mf = context.getString('factory')
    let managerAddress = Address.fromBytes(Address.fromHexString(context.getString('manager')));
    let managerContract = ManagerContract.bind(managerAddress);
    let marketContract = MarketContract.bind(evt.address);
    let market = new Market(evt.address.toHexString());
    market.name = marketContract.name();
    market.hash = hash;
    market.marketFactory = mf;
    market.managementFee = managerContract.creatorFee();
    market.protocolFee = managerContract.protocolFee();
    market.closingTime = marketContract.closingTime();
    market.creationTime = evt.block.timestamp;
    market.submissionTimeout = marketContract.submissionTimeout();
    market.price = marketContract.price();
    market.numOfBets = BigInt.fromI32(0);
    market.numOfEventsWithAnswer = BigInt.fromI32(0);
    market.hasPendingAnswers = true;
    let creator = managerContract.creator();
    let manager = getOrCreateManager(creator);
    market.manager = manager.id;
    market.creator = evt.transaction.from.toHexString();
    market.numOfEvents = BigInt.fromI32(evt.params._questionIDs.length);
    let event = Event.load(evt.params._questionIDs[0].toHexString())
    if (event === null) {
        market.category = '';
        log.warning("handleQuestionsRegistered: Event not found for questionID: {}. Defining empty category", [evt.params._questionIDs[0].toHexString()]);
    } else {
        market.category = event.category;
    }
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
    market.numOfBets = market.numOfBets.plus(BigInt.fromI32(1));
    market.save()

    let player = getOrCreatePlayer(evt.params._player, market.marketFactory);
    
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

    let mf = getOrCreateMarketFactory(market.marketFactory);
    mf.numOfBets = mf.numOfBets.plus(BigInt.fromI32(1));
    mf.totalVolumeBets = mf.totalVolumeBets.plus(evt.transaction.value);
    mf.save()
}

export function handleBetReward(evt: BetReward): void {
    let betID = getBetID(evt.address, evt.params._tokenID)
    log.info("handleBetReward: Betid: {}", [betID.toString()])
    let bet = Bet.load(betID)!
    bet.claim = true;
    bet.reward = evt.params._reward;
    bet.save()
    log.debug("handleBetReward: {} reward claimed from token {}", [evt.params._reward.toString(), evt.params._tokenID.toString()])

    
    let market = Market.load(evt.address.toHexString())!;

    let player = getOrCreatePlayer(Address.fromString(bet.player), market.marketFactory);
    player.pricesReceived = player.pricesReceived.plus(evt.params._reward)
    player.save()
    
    let mf = getOrCreateMarketFactory(market.marketFactory);
    mf.prizedClaimed = mf.prizedClaimed.plus(evt.params._reward);
    mf.save()
}

export function handleFundingReceived(evt: FundingReceived): void {
    let market = Market.load(evt.address.toHexString())!;
    market.pool = market.pool.plus(evt.params._amount);
    market.save()

    let funder = Funder.load(evt.params._funder.toHexString())
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
    log.info("handleFundingReceived: {} funds received from {}", [evt.params._amount.toString(), evt.params._funder.toHexString()])

    let mf = getOrCreateMarketFactory(market.marketFactory);
    mf.totalVolumeFunding = mf.totalVolumeFunding.plus(evt.params._amount);
    mf.save()
}


export function handleManagerReward(evt: ManagementReward): void {
    let market = Market.load(evt.address.toHexString())!;
    market.resultSubmissionPeriodStart = evt.block.timestamp;
    market.save();

    let manager = getOrCreateManager(evt.params._manager);
    manager.managementRewards = manager.managementRewards.plus(evt.params._managementReward);
    manager.save()
}

export function handleAttribution(evt: AttributionEvent): void {
    
    let market = Market.load(evt.address.toHexString())!;
    let providerAddress = evt.params._provider;
    let provider = getOrCreatePlayer(providerAddress, market.marketFactory);
    let attributor = getOrCreatePlayer(evt.transaction.from, market.marketFactory);
    let id = evt.transaction.hash.toHex() + "-" + evt.logIndex.toString()
    let attribution = new Attribution(id)
    attribution.provider = provider.id;
    attribution.attributor = attributor.id;
    attribution.market = market.id;
    let marketSC = MarketContract.bind(evt.address);
    let manager = marketSC.marketInfo().value2;
    let managerSC = ManagerContract.bind(manager);
    let feeCreator = managerSC.creatorFee();
    let feeProtocol = managerSC.protocolFee();
    let attriibutionAmount = feeCreator.div(BigInt.fromI32(2)).plus(feeProtocol.div(BigInt.fromI32(3)));
    attriibutionAmount = attriibutionAmount.times(marketSC.price()).div(BigInt.fromI32(10000));
    attribution.amount = attriibutionAmount;
    attribution.timestamp = evt.block.timestamp;
    attribution.save()

    provider.totalAttributions = provider.totalAttributions.plus(attriibutionAmount);
    provider.save();
}

export function handleTransfer(evt: Transfer): void {
    let betID = getBetID(evt.address, evt.params.tokenId)
    let bet = Bet.load(betID)
    if (bet === null) {
        // most probably it's the minting
        return;
    }
    let market = Market.load(evt.address.toHexString())!
    let newOwner = getOrCreatePlayer(evt.params.to, market.marketFactory)
    bet.player = newOwner.id
    bet.save()
    log.debug("handleTransfer: token ID {} transfered to {}", [betID, newOwner.id]);
}

export function handleRankingUpdated(evt: RankingUpdated): void {
    const betID = getBetID(evt.address, evt.params._tokenID)
    let bet = Bet.load(betID);
    if (bet === null) return;
    bet.ranking = evt.params._index;
    bet.save();
}