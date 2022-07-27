import { Address, BigInt, DataSourceContext, log } from '@graphprotocol/graph-ts';
import { Market } from '../types/templates';
import { NewMarket, CreateMarketCall } from '../types/MarketFactory/MarketFactory';
import { Market as MarketSC } from '../types/templates/Market/Market';
import { Event } from '../types/schema';
import { Realitio } from '../types/RealitioV3/Realitio';
import { RealitioAddress } from './utils/constants';

export function handleNewMarket(evt: NewMarket): void {
  // Start indexing the market; `event.params.market` is the
  // address of the new market contract
  let context = new DataSourceContext()
  context.setString('hash', evt.params.hash.toHexString())
  context.setString('manager', evt.params.manager.toHexString())
  Market.createWithContext(evt.params.market, context);
  log.info("handleNewMarket: {}", [evt.params.market.toHexString()])
}

export function handleCreateMarket(call: CreateMarketCall): void {
  log.debug("handleCreateMarket: call for create Market", []);
  const marketAddress = call.outputs.value0;
  const marketSC = MarketSC.bind(marketAddress);
  let realitioSC = Realitio.bind(Address.fromBytes(RealitioAddress));
  let nonce = 0;
  while (true) {
    let questionID = marketSC.try_questionIDs(BigInt.fromI32(nonce));
    if (questionID.reverted) {
      log.warning("handleCreateMarket: questionID ask reverted. Breaking while", [])
      break;
    };
    let event = new Event(questionID.value.toHexString());
    event.market = marketAddress.toHexString();
    event.nonce = BigInt.fromI32(nonce);
    event.arbitrator = realitioSC.getArbitrator(questionID.value);
    event.openingTs = realitioSC.getOpeningTS(questionID.value);
    event.timeout = realitioSC.getTimeout(questionID.value);
    event.minBond = realitioSC.getMinBond(questionID.value);
    event.bounty = realitioSC.getBounty(questionID.value);
    event.lastBond = BigInt.fromI32(0);
    event.finalizeTs = realitioSC.getFinalizeTS(questionID.value);
    event.contentHash = realitioSC.getContentHash(questionID.value);
    event.historyHash = realitioSC.getHistoryHash(questionID.value);
    event.arbitrationOccurred = false;
    event.isPendingArbitration = false;
    let data = call.inputs.questionsData[nonce];
    let questionText = data.question;
    let fields = questionText.split('\u241f');
    event.title = fields[0];
    let outcomes = fields[1].split('"').join('').split(',');
    event.outcomes = outcomes;
    event.category = fields[2];
    event.lang = fields[3];
    event.save();
    log.debug("handleCreateMarket: event {} for nonce {} created", [questionID.value.toHexString(), nonce.toString()]);
    nonce++
  }
}