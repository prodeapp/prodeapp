import { Address, BigInt, DataSourceContext, log } from '@graphprotocol/graph-ts';
import { Manager, Market } from '../types/templates';
import { NewMarket, CreateMarketCall } from '../types/MarketFactory/MarketFactory';
import { Market as MarketSC } from '../types/templates/Market/Market';
import { getOrCreateEvent, getOrCreateMarketFactory } from './utils/helpers';

export function handleNewMarket(evt: NewMarket): void {
  // Start indexing the market; `event.params.market` is the
  // address of the new market contract
  let context = new DataSourceContext()
  context.setString('hash', evt.params.hash.toHexString())
  context.setString('manager', evt.params.manager.toHexString())
  context.setString('factory', evt.address.toHexString())
  Market.createWithContext(evt.params.market, context);
  log.info("handleNewMarket: {}", [evt.params.market.toHexString()])
  let mf = getOrCreateMarketFactory(evt.address.toHexString());
  mf.numOfMarkets = mf.numOfMarkets.plus(BigInt.fromI32(1));
  mf.save();

  // Start indexing the manager contract
  Manager.create(evt.params.manager);
}

export function handleCreateMarket(call: CreateMarketCall): void {
  log.debug("handleCreateMarket: call for create Market", []);
  const marketAddress = call.outputs.value0;
  const marketSC = MarketSC.bind(marketAddress);
  let nonce = 0;
  while (true) {
    let questionID = marketSC.try_questionIDs(BigInt.fromI32(nonce));
    if (questionID.reverted) {
      log.warning("handleCreateMarket: questionID ask reverted. Breaking while", [])
      break;
    };
    let questionData = call.inputs.questionsData[nonce];
    getOrCreateEvent(questionID.value, marketAddress, BigInt.fromI32(nonce), questionData.question);
    log.debug("handleCreateMarket: event {} for nonce {} created", [questionID.value.toHexString(), nonce.toString()]);
    nonce++
  }
}
