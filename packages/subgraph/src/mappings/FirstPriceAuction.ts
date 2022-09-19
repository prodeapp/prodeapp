import { BigInt, log } from '@graphprotocol/graph-ts';
import { BidUpdate, NewHighestBid } from '../types/FirstPriceAuction/FirstPriceAuction'
import { Base64Ad, Bid, Market } from '../types/schema'
import { getOrCreateBid } from './utils/helpers'

export function handleBidUpdate(event: BidUpdate) {
    let bid = getOrCreateBid(event.params._market, event.params._bidder, event.params._itemID);
    bid.bidPerSecond = event.params._bidPerSecond;
    bid.balance = event.params._newBalance
    if (event.params._newBalance.equals(BigInt.fromI32(0))) {
        bid.removed = true;
    }
    let base64Ad = Base64Ad.load(bid.base64Ad);
    if (base64Ad !== null) {
        if (!base64Ad.markets.includes(event.params._market.toHexString())) {
            let tmp_markets = base64Ad.markets;
            tmp_markets.push(event.params._market.toHexString());
            base64Ad.markets = tmp_markets;
        }
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