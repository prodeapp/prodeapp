import { Address, BigInt, ByteArray } from "@graphprotocol/graph-ts";
import { Player } from "../types/schema";

export function getBetID(tournament: ByteArray, tokenID: Address): string {
    return tournament.toHexString() + '-' + tokenID.toHexString();
}

export function getOrCreatePlayer(address: Address): Player {
    let player = Player.load(address.toString())
    if (player === null) {
        player = new Player(address.toHexString())
        player.amountBeted = BigInt.fromI32(0)
        player.pricesReceived = BigInt.fromI32(0)
        player.save()
    }
    return player
}
