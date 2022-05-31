/* eslint-disable prefer-const */
import {Bytes, log, Address, BigInt} from '@graphprotocol/graph-ts';
import {CurateItem, Registry, MetaEvidence, TournamentCuration, Tournament} from '../types/schema'

import {
  GeneralizedTCR,
  ItemStatusChange,
  ItemSubmitted,
  MetaEvidence as MetaEvidenceEvent
} from '../types/ClasicCurate/GeneralizedTCR';
import {getOrCreateRegistry} from "./helpers";

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

function getStatus(status: number): string {
  if (status == 0) return "Absent";
  if (status == 1) return "Registered";
  if (status == 2) return "RegistrationRequested";
  if (status == 3) return "ClearingRequested";
  return 'Error';
}

function toHexString(byteArray:Uint8Array):string {
  const bufferString = byteArray.reduce((str, byte) => str + String.fromCharCode(byte), '');
  if (bufferString.substring(0, 2) === '0x') return bufferString
  return `0x${bufferString}`
};

function getHashFromData(data:Bytes): string {
  let hashData = data.slice(6, 70)
  // log.debug("getHashFromData: hashData = {}", [hashData.toString()]);
  let hash = toHexString(hashData)
  // log.debug("getHashFromData: hash = {}", [hash]);
  return hash
}

function getStatusFromItemID(itemID: Bytes, contractAddress: Address): string {
  let tcr = GeneralizedTCR.bind(contractAddress);
  let itemInfo = tcr.getItemInfo(itemID);
  return getStatus(itemInfo.value1)
}

function getDataFromItemID(itemID: Bytes, contractAddress: Address): Bytes {
  let tcr = GeneralizedTCR.bind(contractAddress);
  let itemInfo = tcr.getItemInfo(itemID);
  return itemInfo.value0
}

export function handleItemSubmitted(event: ItemSubmitted): void {
  let curateItem = new CurateItem(event.params._itemID.toHexString());
  let itemHash = getHashFromData(event.params._data);
  log.debug("handleItemSubmitted: adding item with hash {}", [itemHash]);
  curateItem.hash = itemHash;
  curateItem.status = getStatus(2);
  curateItem.data = event.params._data;
  curateItem.save();
}

export function handleItemStatusChange(event: ItemStatusChange): void {
  if (event.params._resolved == false) return; // No-op.
  let data = getDataFromItemID(event.params._itemID, event.address);
  log.debug("handleItemStatusChange: data = {}", [data.toHexString()]);

  let curateItem = CurateItem.load(event.params._itemID.toHexString());
  if (curateItem === null) {
    log.error('handleItemStatusChange: curateItem with itemId {} not found in tcr {}. Bailing handleItemStatusChange.', [
      event.params._itemID.toHexString(),
      event.address.toHexString()
    ]);
    return;
  }
  let itemHash = getHashFromData(data)
  log.debug('itemHash: {}', [itemHash]);
  curateItem.hash = itemHash;
  // ask to the SC the status instead of create the logic whing the mapping to 
  // detect the current status.
  curateItem.status = getStatusFromItemID(event.params._itemID, event.address)
  log.debug("handleItemStatusChange: ItemID {} has status {}", [event.params._itemID.toHexString(), curateItem.status])
  curateItem.data = data;
  curateItem.save();

  let tournamentCuration = TournamentCuration.load(curateItem.hash);

  if (curateItem.status === 'Registered' && tournamentCuration !== null) {
    for (let i = 0; i < tournamentCuration.tournaments.length; i++) {
      let tournament = Tournament.load(tournamentCuration.tournaments[i])!;
      tournament.curated = true;
      tournament.save();
    }
  }
}

export function handleMetaEvidence(event: MetaEvidenceEvent): void {
  let registry = getOrCreateRegistry(event.address);

  registry.metaEvidenceCount = registry.metaEvidenceCount.plus(
    BigInt.fromI32(1),
  );

  let metaEvidence = MetaEvidence.load(
    registry.id + '-' + registry.metaEvidenceCount.toString(),
  );
  if (metaEvidence == null) {
    metaEvidence = new MetaEvidence(
      registry.id + '-' + registry.metaEvidenceCount.toString(),
    );
  }

  metaEvidence.URI = event.params._evidence;
  metaEvidence.save();

  if (
    registry.metaEvidenceCount.mod(BigInt.fromI32(2)).equals(BigInt.fromI32(1))
  ) {
    registry.registrationMetaEvidence = metaEvidence.id;
  } else {
    registry.clearingMetaEvidence = metaEvidence.id;
  }

  registry.save();
}