/* eslint-disable prefer-const */
import { Address, ByteArray, Bytes, log } from '@graphprotocol/graph-ts';
import { CurateAdsMapper, CurateSVGAdItem } from '../types/schema';

import {
  ItemStatusChange,
  ItemSubmitted,
} from '../types/ContentCurate/GeneralizedTCR';
import { getDataFromItemID, getStatusFromItemID, u8toString } from './GeneralizedTCR';
import { getCurateProxyIDFromItemID, getOrCreateSVGAd } from './utils/helpers';


export function getAddressFromData(data: Bytes): string {
  // first byte it's the data type and lenght: Array of 2 elements.
  // second byte it's the length of the first element of the array (it's an address, then 20)
  // 20 length of address + 3 the beggining of the data.
  // The rest is the ipfs
  // start = 2 + 2 + 1
  // end = start + 20*2
  return '0x' + data.toHexString().slice(6, 20*2 + 6)
}

export function getIPFSFromData(data: Bytes): string {
  // first byte it's the data type and lenght: Array of 2 elements.
  // second byte it's the length of the first element of the array (it's an address, then 20)
  // 20 length of address + 3 the beggining of the data.
  // The rest is the ipfs
  // start = 2 + 2
  // '80' in hex it's equal to a short string with length 0
  if (data.toHexString().slice(46,48) != '80') {
    return u8toString(data.slice(24))
  }
  // there is no IPFS
  return ''
  
}

export function handleItemStatusChange(evt: ItemStatusChange): void {
  if (evt.params._resolved == false) return; // No-op.

  const itemID = getCurateProxyIDFromItemID(evt.params._itemID);
  if (itemID === null){
    log.warning('handleItemStatusChange: ItemID {} not found in the proxy', [evt.params._itemID.toHexString()])
    return
  }
  log.debug("handleItemStatusChange: itemID {} for contentCurate itemID {}", [itemID, evt.params._itemID.toHexString()])
  let curateItem = CurateSVGAdItem.load(itemID);

  if (curateItem === null) {
    log.error('handleItemStatusChange: CurateSVGAdItem with itemId {} not found for contentItemID {}', [
      itemID,
      evt.params._itemID.toHexString(),
    ]);
    return;
  }

  let data = getDataFromItemID(evt.params._itemID, evt.address);
  log.debug("handleItemStatusChange: data = {}", [data.toHexString()]);
  curateItem.contentStatus = getStatusFromItemID(curateItem.contentItemID, evt.address)
  log.debug("handleItemStatusChange: ItemID {} has status {} in contentCurate", [evt.params._itemID.toHexString(), curateItem.contentStatus])
  curateItem.save();
}

export function handleItemSubmitted(evt: ItemSubmitted): void {
  let curateMapper = new CurateAdsMapper(evt.params._itemID.toHexString())
  const data = getDataFromItemID(evt.params._itemID, evt.address);
  log.debug("handleItemSubmitted: Data {} for itemID {}", [data.toHexString(), evt.params._itemID.toHexString()]);
  
  const adAddress = getAddressFromData(data);
  // log.debug("handleItemSubmitted: Ad address {} in itemID {}", [adAddress, evt.params._itemID.toHexString()])
  // log.debug("handleItemSubmitted: ipfs {} stored for the itemID {}", [getIPFSFromData(data), evt.params._itemID.toHexString()])
  const baseAd = getOrCreateSVGAd(adAddress)
  curateMapper.SVGAd = baseAd.id;
  curateMapper.ipfs = getIPFSFromData(data);
  curateMapper.save()
}