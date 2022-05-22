/* eslint-disable prefer-const */
import { Bytes, log, BigInt, Address } from '@graphprotocol/graph-ts';
import { TournamentCuration } from '../types/schema'

import {
  GeneralizedTCR,
  ItemStatusChange,
} from '../types/ClasicCurate/GeneralizedTCR';

// Items on a TCR can be in 1 of 4 states:
// - (0) Absent: The item is not registered on the TCR and there are no pending requests.
// - (1) Registered: The item is registered and there are no pending requests.
// - (2) Registration Requested: The item is not registered on the TCR, but there is a pending
//       registration request.
// - (3) Clearing Requested: The item is registered on the TCR, but there is a pending removal
//       request. These are sometimes also called removal requests.
//
// Registration and removal requests can be challenged. Once the request resolves (either by
// passing the challenge period or via dispute resolution), the item state is updated to 0 or 1.


function getHashfromItemID(itemID: Bytes, contractAddress: Address): Bytes {
  let tcr = GeneralizedTCR.bind(contractAddress);
  let itemInfo = tcr.getItemInfo(itemID);
  let hash = getHashFromData(itemInfo.value0);
  return hash;
}

function getHashFromData(data: Bytes): Bytes {
  // let decodedData = decodeData(data);
  // return decodedData['hash'];
  // TODO
  return Bytes.fromHexString("0xb4f92335882f48a7bd5a24ee1da68b2ceeed0964db45bf7baa7dab83a2efcf3e")
}

function decodeData(data: Bytes): Object {
  // TODO!
  return {
    hash: Bytes.fromHexString("0xb4f92335882f48a7bd5a24ee1da68b2ceeed0964db45bf7baa7dab83a2efcf3e"),
    startingTimestamp: BigInt.fromI32(0),
    jsonURI: "uriJSON"
  }
}

export function handleItemStatusChange(event: ItemStatusChange): void {
  if (event.params._resolved == false) return; // No-op.

  let tcrAddress = event.address.toHexString();
  let tcr = GeneralizedTCR.bind(event.address);
  let itemInfo = tcr.getItemInfo(event.params._itemID);
  log.debug("handleItemStatusChange: This is the itemInfo.value0 {}, value1 {}, value2 {} for hash itemID {}", [itemInfo.value0.toString(), itemInfo.value1.toString(), itemInfo.value2.toString(), event.params._itemID.toHexString()])
  let itemHash = getHashFromData(itemInfo.value0);
  log.debug('itemHash: {}', [itemHash.toHexString()]);
  let tournamentCuration = TournamentCuration.load(itemHash.toHexString());
  if (tournamentCuration === null) {
    log.error('handleItemStatusChange: tournamentCuration with hash {} not found in tcr {}. Bailing handleItemStatusChange.', [
      itemHash.toHexString(),
      tcrAddress
    ]);
    return;
  }
  tournamentCuration.itemID = event.params._itemID;
  tournamentCuration.status = "RegistrationRequested";
  tournamentCuration.data = itemInfo.value0;
  tournamentCuration.save();
}

// export function handleRequestChallenged(event: Dispute): void {
//   let tcr = GeneralizedTCR.bind(event.address);
//   let itemID = tcr.arbitratorDisputeIDToItem(
//     event.params._arbitrator,
//     event.params._disputeID,
//   );
//   let graphItemID = itemID.toHexString() + '@' + event.address.toHexString();
//   let item = Item.load(graphItemID);
//   if (!item) {
//     log.error(`Item of graphItemID {} not found`, [graphItemID]);
//     return;
//   }

//   item.disputed = true;
//   item.latestChallenger = event.transaction.from;

//   let itemInfo = tcr.getItemInfo(itemID);
//   let requestID =
//     graphItemID + '-' + itemInfo.value2.minus(BigInt.fromI32(1)).toString();
//   let request = Request.load(requestID);
//   if (!request) {
//     log.error(`Request of requestID {} not found.`, [requestID]);
//     return;
//   }

//   request.disputed = true;
//   request.challenger = event.transaction.from;
//   request.numberOfRounds = BigInt.fromI32(2);
//   request.disputeID = event.params._disputeID;

//   let requestInfo = tcr.getRequestInfo(
//     itemID,
//     itemInfo.value2.minus(BigInt.fromI32(1)),
//   );
//   let roundID =
//     requestID + '-' + requestInfo.value5.minus(BigInt.fromI32(2)).toString();
//   let round = Round.load(roundID);
//   if (!round) {
//     log.error(`Request of requestID {} not found.`, [roundID]);
//     return;
//   }

//   let arbitrator = IArbitrator.bind(changetype<Address>(request.arbitrator));
//   let arbitrationCost = arbitrator.arbitrationCost(request.arbitratorExtraData);
//   if (request.requestType == REGISTRATION_REQUESTED)
//     round.amountPaidChallenger = tcr
//       .submissionChallengeBaseDeposit()
//       .plus(arbitrationCost);
//   else
//     round.amountPaidChallenger = tcr
//       .removalChallengeBaseDeposit()
//       .plus(arbitrationCost);

//   round.feeRewards = round.feeRewards
//     .plus(round.amountPaidChallenger)
//     .minus(arbitrationCost);
//   round.hasPaidChallenger = true;
//   round.save();

//   let newRoundID =
//     requestID + '-' + requestInfo.value5.minus(BigInt.fromI32(1)).toString();
//   let newRound = buildNewRound(newRoundID, request.id, event.block.timestamp);
//   newRound.save();
//   request.save();
// }

// export function handleAppealContribution(event: AppealContribution): void {
//   let graphItemID =
//     event.params._itemID.toHexString() + '@' + event.address.toHexString();
//   let item = Item.load(graphItemID);
//   if (item == null) {
//     log.error('GTCR: Item {} @ {} not found. Bailing handleRequestResolved.', [
//       event.params._itemID.toHexString(),
//       event.address.toHexString(),
//     ]);
//     return;
//   }

//   let requestID = graphItemID + '-' + event.params._request.toString();

//   let roundID = requestID + '-' + event.params._round.toString();
//   let round = Round.load(roundID);
//   if (!round) {
//     log.error(`Round of roundID {} not found.`, [roundID]);
//     return;
//   }

//   if (event.params._side == REQUESTER_CODE) {
//     round.amountPaidRequester = round.amountPaidRequester.plus(
//       event.params._amount,
//     );
//     let feeRewards = round.feeRewards;
//     feeRewards = feeRewards.plus(round.amountPaidRequester);
//     round.feeRewards = feeRewards;
//   } else {
//     round.amountPaidChallenger = round.amountPaidChallenger.plus(
//       event.params._amount,
//     );
//     let feeRewards = round.feeRewards;
//     feeRewards = feeRewards.plus(round.amountPaidChallenger);
//     round.feeRewards = feeRewards;
//   }

//   round.save();
// }

// export function handleHasPaidAppealFee(event: HasPaidAppealFee): void {
//   let tcr = GeneralizedTCR.bind(event.address);
//   let graphItemID =
//     event.params._itemID.toHexString() + '@' + event.address.toHexString();
//   let item = Item.load(graphItemID);
//   if (item == null) {
//     log.error('GTCR: Item {} @ {} not found. Bailing handleRequestResolved.', [
//       event.params._itemID.toHexString(),
//       event.address.toHexString(),
//     ]);
//     return;
//   }

//   let requestID = graphItemID + '-' + event.params._request.toString();

//   let requestInfo = tcr.getRequestInfo(
//     event.params._itemID,
//     event.params._request,
//   );
//   let roundID = requestID + '-' + event.params._round.toString();
//   let round = Round.load(roundID);
//   if (!round) {
//     log.error(`Round of roundID {} not found.`, [roundID]);
//     return;
//   }

//   if (event.params._side == REQUESTER_CODE) {
//     round.hasPaidRequester = true;
//   } else {
//     round.hasPaidChallenger = true;
//   }

//   if (round.hasPaidRequester && round.hasPaidChallenger) {
//     let requestID = graphItemID + '-' + event.params._request.toString();
//     let request = Request.load(requestID);
//     if (!request) {
//       log.error(`Request of requestID {} not found.`, [requestID]);
//       return;
//     }

//     let arbitrator = IArbitrator.bind(changetype<Address>(request.arbitrator));
//     let appealCost = arbitrator.appealCost(
//       request.disputeID,
//       request.arbitratorExtraData,
//     );
//     round.feeRewards = round.feeRewards.minus(appealCost);
//     let newRoundID =
//       requestID + '-' + requestInfo.value5.minus(BigInt.fromI32(1)).toString();
//     let newRound = buildNewRound(newRoundID, request.id, event.block.timestamp);
//     newRound.save();

//     request.numberOfRounds = request.numberOfRounds.plus(BigInt.fromI32(1));
//     request.save();
//   }

//   round.save();
// }

// export function handleMetaEvidence(event: MetaEvidenceEvent): void {
//   let registry = Registry.load(event.address.toHexString());
//   if (!registry) {
//     log.error(`Registry at {} not found`, [event.address.toHexString()]);
//     return;
//   }

//   registry.metaEvidenceCount = registry.metaEvidenceCount.plus(
//     BigInt.fromI32(1),
//   );

//   if (registry.metaEvidenceCount.equals(BigInt.fromI32(1))) {
//     // This means this is the first meta evidence event emitted,
//     // in the constructor.
//     // Use this opportunity to create the arbitrator datasource
//     // to start monitoring it for events (if we aren't already).
//     let tcr = GeneralizedTCR.bind(event.address);
//     let arbitratorAddr = tcr.arbitrator();
//     let arbitrator = Arbitrator.load(arbitratorAddr.toHexString());
//     if (arbitrator) return; // Data source already created.

//     IArbitratorDataSourceTemplate.create(arbitratorAddr);
//     arbitrator = new Arbitrator(arbitratorAddr.toHexString());
//     arbitrator.save();
//   }

//   let metaEvidence = MetaEvidence.load(
//     registry.id + '-' + registry.metaEvidenceCount.toString(),
//   );
//   if (metaEvidence == null) {
//     metaEvidence = new MetaEvidence(
//       registry.id + '-' + registry.metaEvidenceCount.toString(),
//     );
//   }

//   metaEvidence.URI = event.params._evidence;
//   metaEvidence.save();

//   if (
//     registry.metaEvidenceCount.mod(BigInt.fromI32(2)).equals(BigInt.fromI32(1))
//   ) {
//     registry.registrationMetaEvidence = metaEvidence.id;
//   } else {
//     registry.clearingMetaEvidence = metaEvidence.id;
//   }

//   registry.save();
// }

// export function handleAppealPossible(event: AppealPossible): void {
//   let registry = Registry.load(event.params._arbitrable.toHexString());
//   if (registry == null) return; // Event not related to a GTCR.

//   let tcr = GeneralizedTCR.bind(event.params._arbitrable);
//   let itemID = tcr.arbitratorDisputeIDToItem(
//     event.address,
//     event.params._disputeID,
//   );
//   let graphItemID =
//     itemID.toHexString() + '@' + event.params._arbitrable.toHexString();
//   let item = Item.load(graphItemID);
//   if (!item) {
//     log.error('Item of graphItemID {} not found.', [graphItemID]);
//     return;
//   }

//   let requestID =
//     item.id + '-' + item.numberOfRequests.minus(BigInt.fromI32(1)).toString();
//   let request = Request.load(requestID);
//   if (!request) {
//     log.error(`Request of requestID {} not found.`, [requestID]);
//     return;
//   }

//   let roundID =
//     request.id +
//     '-' +
//     request.numberOfRounds.minus(BigInt.fromI32(1)).toString();
//   let round = Round.load(roundID);
//   if (!round) {
//     log.error(`Round of roundID {} not found.`, [roundID]);
//     return;
//   }

//   let arbitrator = IArbitrator.bind(event.address);
//   let appealPeriod = arbitrator.appealPeriod(event.params._disputeID);
//   round.appealPeriodStart = appealPeriod.value0;
//   round.appealPeriodEnd = appealPeriod.value1;
//   round.rulingTime = event.block.timestamp;

//   let currentRuling = arbitrator.currentRuling(request.disputeID);
//   round.ruling = currentRuling.equals(BigInt.fromI32(0))
//     ? NONE
//     : currentRuling.equals(BigInt.fromI32(1))
//       ? ACCEPT
//       : REJECT;

//   item.save();
//   round.save();
// }