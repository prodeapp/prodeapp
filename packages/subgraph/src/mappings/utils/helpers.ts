import { Address, BigInt, ByteArray, log } from "@graphprotocol/graph-ts";
import {Player, Manager, Bet, Registry, MarketCuration, Event, MarketFactory, Attribution, MarketReferral} from "../../types/schema";

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

export function getAttributionID(player:string, attributor:string, id:number): string {
    const playerId = player.toString();
    const attributorId = attributor.toString();
    return playerId + "-" + attributorId + "-" + `${id}`;

}

export function getLastAttributionId(player:string, attributor:string): number {
    let i = 0;
    let attributionId = getAttributionID(player, attributor, i)
    let attribution = Attribution.load(attributionId);
    if (attribution === null) return 0;
    while (attribution !== null) {
        i++
        attributionId = getAttributionID(player, attributor, i)
        attribution = Attribution.load(attributionId);
    }
    // return the last valid attribution index
    i--
    return i;
}

export function getOrCreateMarketReferral(market:string, player:string, manager:string): MarketReferral {
    let id = market + "-" + player;
    let mr = MarketReferral.load(id);
    if (mr === null) {
        mr = new MarketReferral(id);
        mr.totalAmount = BigInt.fromI32(0);
        mr.market = market;
        mr.provider = player;
        mr.manager = manager;
        mr.claimed = false;
        mr.save()
        log.debug("getOrCreateMarketReferral: Creating {}", [id]);
    }
    return mr
}

export function getCurrentRanking(market: ByteArray): Bet[] {
    let bets: Bet[];
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
    entity.market = baseEvent.market;
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