import { Address, BigInt, ByteArray, Bytes, log, ethereum, crypto } from "@graphprotocol/graph-ts";
import { Realitio } from "../../types/RealitioV3/Realitio";
import {Player, Manager, Bet, Registry, MarketCuration, Event, MarketFactory, Attribution, MarketReferral,
        Market, Bid, CurateSVGAdItem, SVGAd, CurateAdsMapper} from "../../types/schema";
import { RealitioAddress } from "./constants";

export function getBetID(market: ByteArray, tokenID: BigInt): string {
    return market.toHexString() + '-' + tokenID.toString();
}

export function getOrCreatePlayer(address: Address, marketFactory: string): Player {
    let player = Player.load(address.toHexString())
    if (player === null) {
        player = new Player(address.toHexString())
        player.amountBet = BigInt.fromI32(0)
        player.pricesReceived = BigInt.fromI32(0)
        player.numOfMarkets = BigInt.fromI32(0)
        player.numOfBets = BigInt.fromI32(0)
        player.totalAttributions = BigInt.fromI32(0)
        player.name = address.toHexString();
        player.save()

        let mf = getOrCreateMarketFactory(marketFactory);
        mf.numOfPlayers = mf.numOfPlayers.plus(BigInt.fromI32(1));
        mf.save()
    }
    return player
}

export function getOrCreateManager(address: Address): Manager {
    let manager = Manager.load(address.toHexString())
    if (manager === null) {
        manager = new Manager(address.toHexString())
        manager.managementRewards = BigInt.fromI32(0)
        manager.claimed = false;
        manager.save()
    }
    return manager
}

export function getOrCreateRegistry(address: Address): Registry {
    let registry = Registry.load(address.toHexString())
    if (registry === null) {
        registry = new Registry(address.toHexString())
        registry.save()
    }
    return registry
}

export function getOrCreateMarketCuration(hash: string): MarketCuration {
    let marketCuration = MarketCuration.load(hash)
    if (marketCuration === null) {
        marketCuration = new MarketCuration(hash)
        marketCuration.save()
    }
    return marketCuration
}

export function getAttributionID(provider:string, attributor:string, id:number): string {
    const providerId = provider.toString();  // who will receive the fees
    const attributorId = attributor.toString();  // who has use the referral link
    return providerId + "-" + attributorId + "-" + `${id}`;

}

export function getLastAttributionId(provider:string, attributor:string): number {
    let i = 0;
    let attributionId = getAttributionID(provider, attributor, i)
    let attribution = Attribution.load(attributionId);
    if (attribution === null) return 0;
    while (attribution !== null) {
        i++
        attributionId = getAttributionID(provider, attributor, i)
        attribution = Attribution.load(attributionId);
    }
    // return the last valid attribution index
    return i--;
}

export function getOrCreateMarketReferral(market:string, provider:string, manager:string): MarketReferral {
    let id = market + "-" + provider;
    let mr = MarketReferral.load(id);
    let marketEntity = Market.load(market);
    if (mr === null) {
        mr = new MarketReferral(id);
        mr.totalAmount = BigInt.fromI32(0);
        mr.market = marketEntity!.id;
        mr.provider = getOrCreatePlayer(Address.fromString(provider), marketEntity!.marketFactory).id;
        mr.manager = manager;
        mr.claimed = false;
        mr.save()
        log.debug("getOrCreateMarketReferral: Creating {}", [id]);
    }
    return mr
}

export function getCurrentRanking(market: ByteArray): Bet[] {
    let bets: Bet[] = [];
    let tokenID = BigInt.fromI32(0);
    let _bet: Bet | null;
    while (true) {
        let betID = getBetID(market, tokenID);
        _bet = Bet.load(betID);
        if (_bet === null) break;
        bets.push(_bet);
    }
    // sort by points, if equal points, the first in bet get the higher ranking
    return bets.sort((a, b) => (a.points > b.points) ? 1 : (a.points === b.points) ? ((a.tokenID > b.tokenID) ? 1 : -1) : -1)
}


export function duplicateEvent(baseEvent: Event, newEventID: string): Event {
    let entity = new Event(newEventID);
    entity.nonce = baseEvent.nonce;
    entity.arbitrator = baseEvent.arbitrator;
    entity.markets = baseEvent.markets;
    entity.category = baseEvent.category;
    entity.title = baseEvent.title;
    entity.lang = baseEvent.lang;
    entity.outcomes = baseEvent.outcomes;
    entity.arbitrationOccurred = false;
    entity.isPendingArbitration = false;
    entity.openingTs = baseEvent.openingTs;
    entity.finalizeTs =  baseEvent.finalizeTs;
    entity.timeout = baseEvent.timeout;
    entity.minBond = baseEvent.minBond;
    entity.lastBond = BigInt.fromI32(0);
    entity.bounty = baseEvent.bounty;
    entity.contentHash = baseEvent.contentHash;
    entity.historyHash = baseEvent.historyHash;
    entity.answer = null;
    entity.reopenedEvents = baseEvent.reopenedEvents;
    entity.save();
    return entity;
}


export function getOrCreateMarketFactory(id: string): MarketFactory {
    let mf = MarketFactory.load(id);
    if (mf === null){
      mf = new MarketFactory(id);
      mf.numOfMarkets = BigInt.fromI32(0);
      mf.numOfBets = BigInt.fromI32(0);
      mf.numOfPlayers = BigInt.fromI32(0);
      mf.prizedClaimed = BigInt.fromI32(0);
      mf.totalVolumeBets = BigInt.fromI32(0);
      mf.totalVolumeFunding = BigInt.fromI32(0);
      mf.save()
    }
    return mf
}

export function getOrCreateEvent(questionID:Bytes, marketAddress:Address, nonce:BigInt, questionText: string, templateID:BigInt, timestamp:BigInt): Event {
    let realitioSC = Realitio.bind(Address.fromBytes(RealitioAddress));
    let event = Event.load(questionID.toHexString());
    if (event === null) {
        event = new Event(questionID.toHexString());
    event.markets = [marketAddress.toHexString()];
    event.nonce = nonce;
    event.arbitrator = realitioSC.getArbitrator(questionID);
    event.openingTs = realitioSC.getOpeningTS(questionID);
    event.timeout = realitioSC.getTimeout(questionID);
    event.minBond = realitioSC.getMinBond(questionID);
    event.bounty = realitioSC.getBounty(questionID);
    event.lastBond = BigInt.fromI32(0);
    event.finalizeTs = realitioSC.getFinalizeTS(questionID);
    event.creationTs = timestamp;
    event.contentHash = realitioSC.getContentHash(questionID);
    event.historyHash = realitioSC.getHistoryHash(questionID);
    event.arbitrationOccurred = false;
    event.isPendingArbitration = false;
    let fields = questionText.split('\u241f');
    let outcomes = fields[1].split('"').join('').split(',');
    event.title = fields[0];
    event.outcomes = outcomes;
    event.category = fields[2];
    event.lang = fields[3];
    event.templateID = templateID;
    } else {
        // add market to markets
        let tmp_markets = event.markets
        tmp_markets.push(marketAddress.toHexString())
        event.markets = tmp_markets;
    }
    event.save()
    return event
}

export function getBidID(market: Address, bidder: Address, itemID: Bytes): string {
    return market.toHexString() + '-' + bidder.toHexString() + '-' + itemID.toHexString();

}

export function getOrCreateBid(market: Address, bidder: Address, itemID: Bytes): Bid|null {
    const bidID = getBidID(market, bidder, itemID)
    let bid = Bid.load(bidID);
    if (bid === null){
        bid = new Bid(bidID);
        bid.balance = BigInt.fromI32(0);
        bid.bidPerSecond = BigInt.fromI32(0);
        bid.bidder = bidder;
        const _market = Market.load(market.toHexString());

        if (_market === null) {
            return null;
        }

        bid.market = _market.id;
        bid.currentHighest = false;
        bid.startTimestamp = BigInt.fromI32(0);
        let curateItem = CurateSVGAdItem.load(itemID.toHexString());
        if (curateItem === null) {
            log.warning('getOrCreateBid: CurateItem not found when creating Bid for itemID {}', [itemID.toHexString()])
        } else {
            bid.SVGAd = curateItem.SVGAd;        
            bid.curateSVGAdItem = curateItem.id;
            let svgAd = getOrCreateSVGAd(curateItem.SVGAd);
            let bids = svgAd.bids;
            bids.push(bid.id);
            svgAd.bids = bids;
            svgAd.save()
        }       
        bid.save()
        log.debug('getOrCreateBid: New Bid with id: {}!', [bidID]);
        return bid
    }
    return bid;
}

export function getOrCreateSVGAd(address: string): SVGAd {
    let svgAd = SVGAd.load(address);
    if (svgAd == null){
        svgAd = new SVGAd(address);
        svgAd.markets = [];
        svgAd.bids = [];
        svgAd.save()
    }
    return svgAd
}

export function getCurateProxyIDFromItemID(_itemID: Bytes): string | null {
    let curateMapper = CurateAdsMapper.load(_itemID.toHexString())!;

    let svgAd = SVGAd.load(curateMapper.SVGAd)
    if (svgAd !== null){
        return svgAd.curateSVGAdItem;
    }
    return null
}
