import { DataSourceContext, log } from '@graphprotocol/graph-ts'
import { Market } from '../types/templates'
import { NewMarket } from '../types/MarketFactory/MarketFactory'

export function handleNewMarket(event: NewMarket): void {
  // Start indexing the market; `event.params.market` is the
  // address of the new market contract
  let context = new DataSourceContext()
  context.setString('hash', event.params.hash.toHexString())
  Market.createWithContext(event.params.market, context);
  log.info("handleNewMarket: {}", [event.params.market.toHexString()])
}