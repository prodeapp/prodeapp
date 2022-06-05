/* eslint-disable prefer-const */
import {Bytes, log, Address, BigInt, ByteArray} from '@graphprotocol/graph-ts';
import {CurateItem, MetaEvidence, TournamentCuration, Tournament} from '../types/schema'

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

function u8toString(byteArray:Uint8Array):string {
  const bufferString = byteArray.reduce((str, byte) => str + String.fromCharCode(byte), '');
  return bufferString
};

function u8toBigInt(byteArray:Uint8Array):BigInt {
  let result = BigInt.fromI32(0);
  for (let i=0; i<byteArray.length; i++) {
    result = result.times(BigInt.fromI32(256)).plus(BigInt.fromI32(byteArray[i]));
  }
  return result
}

function getHashIndex(data:Bytes): BigInt {
  let dataAsStr = data.toHexString();
  // use last index to avoid conflicts if the title has 0x.
  // div 2 for the convertion between bytes and char
  return BigInt.fromI64(dataAsStr.lastIndexOf('3078')).div(BigInt.fromI32(2)).minus(BigInt.fromI32(1))  
}

function getIPFSIndex(data:Bytes): BigInt {
  let dataAsStr = data.toHexString();
  // use last index to avoid conflicts if the title has the same chars (/ipfs).
  return BigInt.fromI64(dataAsStr.lastIndexOf('2f69706673')).div(BigInt.fromI32(2)).minus(BigInt.fromI32(1))
}

function getHashFromData(data:Bytes): string {
  const hashIndex = getHashIndex(data).toI32();
  // log.debug("getHashFromData: data as hex string {}", [data.toHexString()])
  // log.debug("getHashFromData: index found at {}", [hashIndex.toString()])
  let hash:string
  if (hashIndex === -1){
    // couln't found 0x character. So isn't possible to know where the hash is.
    hash = "0x00"
    log.warning("getHashFromData: Couln't found 0x in the data array. returning 0x00 as hash", [])
  } else {
    // if the user put a hash with wrong length, this field will be misread.
    hash = u8toString(data.slice(hashIndex, hashIndex+64))
    // log.debug("getHashFromData: hash slice: {}", [data.slice(hashIndex, hashIndex+64).toString()])
  }
  // log.debug("getHashFromData: hash = {}", [hash])
  return hash
}

function getTitleFromData(data:Bytes): string {
  const hashIndex = getHashIndex(data).toI32();
  // log.debug("getTitleFromData: hash index found at {}", [hashIndex.toString()])
  // log.debug("getTitleFromData: data as hex string {}", [data.toHexString()])
  let title:string
  if (hashIndex > 5){
    // TODO: this "3" may fail if the tittle it's too long.
    // Up to the last char before the beggining of the title.
    // if the user put a hash with wrong length, this field will be misread.
    title = u8toString(data.slice(3, hashIndex-1))
  } else {
    log.warning("getTitleFromData: Couln't found 0x in the data array. retrieving error as title", [])
    return "Error"
  }
  // log.debug("getTitleFromData: title = {}", [title])
  return title
}

function getIPFSFromData(data:Bytes): string {
  const ipfsIndex = getIPFSIndex(data).toI32();
  // log.debug("getIPFSFromData: index found at {} and data length it's {}", [ipfsIndex.toString(), data.length.toString()])
  // log.debug("getIPFSFromData: data as hex string {}", [data.toHexString()])
  let ipfs:string
  if (ipfsIndex !== -1){
    ipfs = u8toString(data.slice(ipfsIndex, data.length))
  } else {
    log.warning("getIPFSFromData: Couln't found /ipfs/ in the data array. retrieving a null string as ipfs", [])
    return ''
  }
  // log.debug("getIPFSFromData: json uri {}", [ipfs])
  return ipfs
}

function getTimestmapFromData(data:Bytes): BigInt {
  // 64 should be the length of the hash
  let startIndex = getHashIndex(data).toI32() + 64 + 3;
  // up to the previous byte of where IPFS begins
  let endIndex = getIPFSIndex(data).toI32() - 2;
  let timestamp:BigInt
  if ((startIndex !== -1 && endIndex !== -1) && (startIndex < endIndex)){
    // after the hash and before the timestamp
    let dataSlice = data.slice(startIndex, endIndex)
    timestamp = u8toBigInt(dataSlice)

  } else {
    log.warning("getTimestmapFromData: Couln't found /ipfs/ or the hash in the data array. retrieving 0 as timestamp", [])
    return BigInt.fromI32(0)
  }
  // log.debug("getTimestmapFromData: timestamp = {}", [timestamp.toString()])
  return timestamp
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
  let itemTitle = getTitleFromData(event.params._data);
  let json = getIPFSFromData(event.params._data);
  let timestamp = getTimestmapFromData(event.params._data);
  // log.debug("handleItemSubmitted: adding item with hash {}", [itemHash]);
  curateItem.hash = itemHash;
  curateItem.status = getStatus(2);
  curateItem.data = event.params._data;
  curateItem.title = itemTitle;
  curateItem.json = json;
  curateItem.timestamp = timestamp;
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
  // log.debug('itemHash: {}', [itemHash]);
  curateItem.hash = itemHash;
  // ask to the SC the status instead of create the logic whing the mapping to 
  // detect the current status.
  curateItem.status = getStatusFromItemID(event.params._itemID, event.address)
  // log.debug("handleItemStatusChange: ItemID {} has status {}", [event.params._itemID.toHexString(), curateItem.status])
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