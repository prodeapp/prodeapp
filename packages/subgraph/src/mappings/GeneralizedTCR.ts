/* eslint-disable prefer-const */
import { Bytes, log, Address } from '@graphprotocol/graph-ts';
import { TournamentCuration } from '../types/schema'

import {
  GeneralizedTCR,
  ItemStatusChange,
  ItemSubmitted,
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

function getStatusfromItemID(itemID: Bytes, contractAddress: Address): string {
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
  let itemHash = getHashFromData(event.params._data);
  log.debug("handleItemSubmitted: adding item with hash {}", [itemHash]);
  let tournamentCuration = TournamentCuration.load(itemHash);
  if (tournamentCuration === null) {
    let tcrAddress = event.address.toHexString();
    log.error('handleItemStatusChange: tournamentCuration with hash {} not found in tcr {}. Bailing handleItemStatusChange.', [
      itemHash,
      tcrAddress
    ]);
    return;
  }
  tournamentCuration.itemID = event.params._itemID;
  tournamentCuration.status = getStatus(2);
  log.debug("handleItemSubmitted: updating status {} to item with hash {}", [tournamentCuration.status, itemHash]);
  tournamentCuration.data = event.params._data;
  tournamentCuration.save();
}

export function handleItemStatusChange(event: ItemStatusChange): void {
  if (event.params._resolved == false) return; // No-op.
  let data = getDataFromItemID(event.params._itemID, event.address);
  log.debug("handleItemStatusChange: data = {}", [data.toHexString()]);
  let itemHash = getHashFromData(data)
  log.debug('itemHash: {}', [itemHash]);
  let tournamentCuration = TournamentCuration.load(itemHash);
  if (tournamentCuration === null) {
    log.error('handleItemStatusChange: tournamentCuration with hash {} not found in tcr {}. Bailing handleItemStatusChange.', [
      itemHash,
      event.address.toHexString()
    ]);
    return;
  }
  tournamentCuration.itemID = event.params._itemID;
  // ask to the SC the status instead of create the logic whing the mapping to 
  // detect the current status.
  tournamentCuration.status = getStatusfromItemID(event.params._itemID, event.address)
  log.debug("handleItemStatusChange: ItemID {} has status {}", [event.params._itemID.toHexString(), tournamentCuration.status])
  tournamentCuration.data = data;
  tournamentCuration.save();
}