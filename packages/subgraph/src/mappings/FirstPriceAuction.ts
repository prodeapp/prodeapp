import { BigInt, log } from '@graphprotocol/graph-ts';
import { BidUpdate, NewHighestBid } from '../types/FirstPriceAuction/FirstPriceAuction'
import { Bid, Market } from '../types/schema'
import { getOrCreateBid } from './utils/helpers'

export function handleBidUpdate(event: BidUpdate) {
    let bid = getOrCreateBid(event.params._market, event.params._bidder, event.params._itemID);
    bid.bidPerSecond = event.params._bidPerSecond;
    bid.balance = event.params._newBalance
    if (event.params._newBalance.equals(BigInt.fromI32(0))) {
        bid.removed = true;
    }
    bid.save()

}

export function handleNewHighestBid(event: NewHighestBid) {
    let bid = getOrCreateBid(event.params._market, event.params._bidder, event.params._itemID);
    log.debug("handleNewHighestBid: New Highest Bid with id: {}", [bid.id]);
    bid.currentHighest = true;
    bid.startTimestamp = event.block.timestamp;
    bid.save()

    let market = Market.load(event.params._market.toHexString())!;
    market.highestBid = bid.id;
    market.save()
    

}