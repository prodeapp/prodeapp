import { log, BigInt, store } from '@graphprotocol/graph-ts';
import { SetValue } from '../types/KeyValue/KeyValue'
import { Market } from '../types/schema';

export function handleSetValue(evt: SetValue): void {
    log.info("handleSetValue: key {} value {} from {}", [evt.params.key, evt.params.value, evt.transaction.from.toHexString()]);

    if (evt.params.key == 'deleteMarket') {
        let market = Market.load(evt.params.value);

        if (!market) {
            return;
        }

        if (market.creator == evt.transaction.from.toHexString() && market.pool.equals(BigInt.fromI32(0))) {
            log.debug("handleSetValue: Deleting event {} ", [market.id]);
            store.remove("Market", market.id);
        }
    }
}