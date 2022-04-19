import { Address, BigInt, ByteArray } from "@graphprotocol/graph-ts";
import { Player, Manager } from "../types/schema";

export function getBetID(tournament: ByteArray, tokenID: BigInt): string {
    return tournament.toHexString() + '-' + tokenID.toString();
}

export function getOrCreatePlayer(address: Address): Player {
    let player = Player.load(address.toHexString())
    if (player === null) {
        player = new Player(address.toHexString())
        player.amountBeted = BigInt.fromI32(0)
        player.pricesReceived = BigInt.fromI32(0)
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
