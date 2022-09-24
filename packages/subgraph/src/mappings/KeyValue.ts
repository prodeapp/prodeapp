import { log, BigInt, store } from '@graphprotocol/graph-ts';
import { SetValue } from '../types/KeyValue/KeyValue'
import { Market, Player } from '../types/schema';
import {getOrCreateMarketCuration} from "./utils/helpers";

export function handleSetValue(evt: SetValue): void {
    log.info("handleSetValue: key {} value {} from {}", [evt.params.key, evt.params.value, evt.transaction.from.toHexString()]);

    if (evt.params.key == 'deleteMarket') {
        let market = Market.load(evt.params.value);

        if (!market) {
            return;
        }

        if (market.creator == evt.transaction.from.toHexString() && market.pool.equals(BigInt.fromI32(0))) {
            log.debug("handleSetValue: Deleting event {} ", [market.id]);

            let marketCuration = getOrCreateMarketCuration(market.hash);

            const position = marketCuration.markets.indexOf(market.id);
            const tmp = marketCuration.markets;
            tmp.splice(position, 1);
            marketCuration.markets = tmp;

            marketCuration.save();

            store.remove("Market", market.id);
        }
    } else if (evt.params.key == 'setName') {
        let player = Player.load(evt.transaction.from.toHexString())
        if (player !== null){
            player.name = evt.params.value
            player.save()
        } else{
            log.warning('handleSetValue: Player {} do not exist', [evt.transaction.from.toHexString()]);
        }
    }
}