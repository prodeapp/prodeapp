import { BigInt, DataSourceContext, log } from '@graphprotocol/graph-ts'
import { Market } from '../types/templates'
import { NewMarket, CreateMarketCall } from '../types/MarketFactory/MarketFactory'
import { Market as MarketSC } from '../types/templates/Market/Market'
import { Event } from '../types/schema'

export function handleNewMarket(evt: NewMarket): void {
  // Start indexing the market; `event.params.market` is the
  // address of the new market contract
  let context = new DataSourceContext()
  context.setString('hash', evt.params.hash.toHexString())
  context.setString('manager', evt.params.manager.toHexString())
  Market.createWithContext(evt.params.market, context);
  log.info("handleNewMarket: {}", [evt.params.market.toHexString()])
}

// export function handleCreateMarket(call: CreateMarketCall): void {
//   log.debug("handleCreateMarket: call for create Market", []);
//   const marketAddress = call.outputs.value0;
//   const marketSC = MarketSC.bind(marketAddress);
//   let i = 0;
//   while (true) {
//     let questionID = marketSC.try_questionIDs(BigInt.fromI32(i));
//     if (questionID.reverted) {
//       log.warning("handleCreateMarket: questionID ask reverted. Breaking while", [])
//       break;
//     };
//     let event = Event.load(questionID.value.toHexString());
//     if (event === null) {
//       log.error("handleCreateMarket: Could not found event with questionID {} ", [questionID.value.toHexString()]);
//       break;
//     }
//     let questionData = call.inputs.questionsData[i]; 
//     let fields = questionData.question.split('\u241f');   
//     log.debug("handleCreateMarket: question: []", [questionData.question]);
//     log.debug("handleCreateMarket: question fields: {}", [fields.toString()])
//   }
// }