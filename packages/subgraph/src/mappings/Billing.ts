import { log } from '@graphprotocol/graph-ts';
import { BalanceChanged } from '../types/Billing/Billing';
import { Bid, Market } from '../types/schema';


export function handleBalanceChanged(event: BalanceChanged) {
    let market = Market.load(event.params._market.toHexString())
    if (market === null) {
        log.warning("Trying to increase the balance in a non existing Market {}",
                    [event.params._market.toHexString()])
        return;
    }
    market.adBalance = event.params._newBalance;
    market.save()

}