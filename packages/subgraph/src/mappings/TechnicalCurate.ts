/* eslint-disable prefer-const */
import { Address, Bytes, log } from '@graphprotocol/graph-ts';
import { CurateAdsMapper, CurateBase64AdItem } from '../types/schema';

import {
  GeneralizedTCR,
  ItemSubmitted,
  ItemStatusChange,
} from '../types/ContentCurate/GeneralizedTCR';
import { getDataFromItemID, getStatusFromItemID } from './GeneralizedTCR';
import { getCurateProxyIDFromItemID } from './utils/helpers';


export function handleItemStatusChange(evt: ItemStatusChange): void {
  if (evt.params._resolved == false) return; // No-op.

  const itemID = getCurateProxyIDFromItemID(evt.params._itemID);
  log.debug("handleItemSubmitted: itemID {} for technicalCurate itemID {}", [itemID, evt.params._itemID.toHexString()])
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
  log.debug("handleItemSubmitted: Data {}", [data.toHexString()]);
  curateMapper.curateBase64AdItem = data.slice(3, 69).toString();
  curateMapper.save()
}