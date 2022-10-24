import { BigInt, log, store } from '@graphprotocol/graph-ts';
import { BidUpdate, NewHighestBid } from '../types/FirstPriceAuction/FirstPriceAuction'
import { Bid, Market } from '../types/schema'
import { getOrCreateSVGAd, getOrCreateBid } from './utils/helpers'

export function handleBidUpdate(event: BidUpdate): void {
    let bid = getOrCreateBid(event.params._market, event.params._bidder, event.params._itemID);

    if (bid === null) {
        log.warning('getOrCreateBid: market not found {}', [event.params._market.toHexString()]);
        return;
    }

    let svgAd = getOrCreateSVGAd(bid.SVGAd);
    if (event.params._newBalance.equals(BigInt.fromI32(0))) {
        let market = Market.load(bid.market)!;
        if (market.highestBid == bid.id) {
            market.highestBid = null;
            market.save();
        }
        if (svgAd.bids.length === 0){
            let tmp_markets = svgAd.markets;
            const marketIndex = tmp_markets.indexOf(event.params._market.toHexString())
            if (marketIndex !== -1){
                tmp_markets.splice(marketIndex, 1);
                svgAd.markets = tmp_markets;
                svgAd.save()
            } else {
                log.warning("handleBidUpdate: we shouldn't be here...", [])
            }
        }
        store.remove("Bid", bid.id);
        return
    }
    bid.bidPerSecond = event.params._bidPerSecond;
    bid.balance = event.params._newBalance
    
    
    if (svgAd !== null) {
        log.debug("handleBidUpdate: Updating svgAd {}", [bid.SVGAd]);
        if (!svgAd.markets.includes(event.params._market.toHexString())) {
            let tmp_markets = svgAd.markets;
            tmp_markets.push(event.params._market.toHexString());
            svgAd.markets = tmp_markets;
            svgAd.save()
        }
    }
    bid.save()
}

export function handleNewHighestBid(event: NewHighestBid): void {
    let bid = getOrCreateBid(event.params._market, event.params._bidder, event.params._itemID);

    if (bid === null) {
        log.warning('getOrCreateBid: market not found {}', [event.params._market.toHexString()]);
        return;
    }

    log.debug("handleNewHighestBid: New Highest Bid with id: {}", [bid.id]);
    bid.currentHighest = true;
    bid.startTimestamp = event.block.timestamp;
    bid.save()

    let market = Market.load(event.params._market.toHexString())!;
    if (market.highestBid !== null){
        let oldBid = Bid.load(market.highestBid!)!;
        log.debug("handleNewHighestBid: removing highest condition from previous bid {}", [oldBid.id]);
        oldBid.currentHighest = false
        oldBid.save()
    }
    market.highestBid = bid.id;
    market.highestBidAd = bid.SVGAd;
    market.save()
}