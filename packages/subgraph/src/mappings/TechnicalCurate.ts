/* eslint-disable prefer-const */
import { Address, Bytes, log } from '@graphprotocol/graph-ts';
import { CurateAdsMapper, CurateBase64AdItem } from '../types/schema';

import {
  GeneralizedTCR,
  ItemSubmitted,
  ItemStatusChange,
} from '../types/ContentCurate/GeneralizedTCR';
import { getDataFromItemID, getStatusFromItemID, u8toString } from './GeneralizedTCR';
import { getCurateProxyIDFromItemID, getOrCreateBase64Ad } from './utils/helpers';
import { getAddressFromData, getIPFSFromData } from './ContentCurate';


export function handleItemStatusChange(evt: ItemStatusChange): void {
  if (evt.params._resolved == false) return; // No-op.

  const itemID = getCurateProxyIDFromItemID(evt.params._itemID);
  if (itemID === null){
    log.warning('handleItemStatusChange: ItemID {} not found in the proxy', [evt.params._itemID.toHexString()])
    return
  }
  log.debug("handleItemStatusChange: itemID {} for technicalCurate itemID {}", [itemID, evt.params._itemID.toHexString()])
  let curateItem = CurateBase64AdItem.load(itemID);

  if (curateItem === null) {
    log.error('handleItemStatusChange: CurateBase64AdItem with itemId {} not found for technicalItemID {}', [
      itemID,
      evt.params._itemID.toHexString(),
    ]);
    return;
  }

  let data = getDataFromItemID(evt.params._itemID, evt.address);
  log.debug("handleItemStatusChange: data = {}", [data.toHexString()]);
  curateItem.technicalStatus = getStatusFromItemID(curateItem.technicalItemID, evt.address)
  log.debug("handleItemStatusChange: ItemID {} has status {} in technicalCurate", [evt.params._itemID.toHexString(), curateItem.technicalStatus])
  curateItem.save();
}

export function handleItemSubmitted(evt: ItemSubmitted): void {
  let curateMapper = new CurateAdsMapper(evt.params._itemID.toHexString())
  const data = getDataFromItemID(evt.params._itemID, evt.address);

  const adAddress = getAddressFromData(data);
  log.debug("handleItemSubmitted: Ad address {} in itemID {}", [adAddress, evt.params._itemID.toHexString()])
  const baseAd = getOrCreateBase64Ad(adAddress)
  curateMapper.base64Ad = baseAd.id;
  curateMapper.ipfs = getIPFSFromData(data);
  curateMapper.save()
}