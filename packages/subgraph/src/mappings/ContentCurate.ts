/* eslint-disable prefer-const */
import { Address, Bytes, log } from '@graphprotocol/graph-ts';
import { CurateAdsMapper, CurateBase64AdItem } from '../types/schema';

import {
  ItemStatusChange,
  ItemSubmitted,
} from '../types/ContentCurate/GeneralizedTCR';
import { getDataFromItemID, getStatusFromItemID } from './GeneralizedTCR';
import { getCurateProxyIDFromItemID } from './utils/helpers';


export function handleItemStatusChange(evt: ItemStatusChange): void {
  if (evt.params._resolved == false) return; // No-op.

  const itemID = getCurateProxyIDFromItemID(evt.params._itemID);
  log.debug("handleItemStatusChange: itemID {} for contentCurate itemID {}", [itemID, evt.params._itemID.toHexString()])
  let curateItem = CurateBase64AdItem.load(itemID);

  if (curateItem === null) {
    log.error('handleItemStatusChange: CurateBase64AdItem with itemId {} not found for contentItemID {}', [
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
  curateMapper.curateBase64AdItem = data.slice(3, 69).toString();
  curateMapper.save()
}