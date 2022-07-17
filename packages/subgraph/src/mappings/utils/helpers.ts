import { Address, BigInt, ByteArray } from "@graphprotocol/graph-ts";
import {Player, Manager, Bet, Registry, MarketCuration} from "../../types/schema";

export function getBetID(market: ByteArray, tokenID: BigInt): string {
    return market.toHexString() + '-' + tokenID.toString();
}

export function getOrCreatePlayer(address: Address): Player {
    let player = Player.load(address.toHexString())
    if (player === null) {
        player = new Player(address.toHexString())
        player.amountBet = BigInt.fromI32(0)
        player.pricesReceived = BigInt.fromI32(0)
        player.numOfMarkets = BigInt.fromI32(0)
        player.numOfBets = BigInt.fromI32(0)
        player.totalAttributions = BigInt.fromI32(0)
        player.save()
    }
    return player
}


export function getOrCreateManager(address: Address): Manager {
    let manager = Manager.load(address.toHexString())
    if (manager === null) {
        manager = new Manager(address.toHexString())
        manager.managementRewards = BigInt.fromI32(0)
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