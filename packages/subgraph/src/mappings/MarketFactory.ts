import { DataSourceContext, log } from '@graphprotocol/graph-ts'
import { Market } from '../types/templates'
import { NewMarket } from '../types/MarketFactory/MarketFactory'

export function handleNewMarket(evt: NewMarket): void {
  // Start indexing the market; `event.params.market` is the
  // address of the new market contract
  let context = new DataSourceContext()
  context.setString('hash', evt.params.hash.toHexString())
  Market.createWithContext(evt.params.market, context);
  log.info("handleNewMarket: {}", [evt.params.market.toHexString()])
}