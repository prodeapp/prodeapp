import { log } from '@graphprotocol/graph-ts';
import { BalanceChanged } from '../types/Billing/Billing';
import { Market } from '../types/schema';


export function handleBalanceChanged(event: BalanceChanged): void {
    let market = Market.load(event.params._market.toHexString())
    if (market === null) {
        log.warning("Trying to change the balance in a non existing Market {}",
                    [event.params._market.toHexString()])
        return;
    }
    market.billingBalance = event.params._newBalance;
    market.save()
}