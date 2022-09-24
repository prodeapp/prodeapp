/* eslint-disable prefer-const */
import { Address, Bytes, log } from '@graphprotocol/graph-ts';
import { CurateBase64AdItem } from '../types/schema';

import {
  GeneralizedTCR,
  ItemStatusChange,
} from '../types/ContentCurate/GeneralizedTCR';
import { getDataFromItemID, getStatusFromItemID } from './GeneralizedTCR';
import { getCurateProxyIDFromItemID } from './utils/helpers';


export function handleItemStatusChange(evt: ItemStatusChange): void {
  if (evt.params._resolved == false) return; // No-op.

  const itemID = getCurateProxyIDFromItemID(evt.params._itemID);
  log.debug("handleItemSubmitted: itemID {} for contentCurate itemID {}", [itemID, evt.params._itemID.toHexString()])
  let curateItem = CurateBase64AdItem.load(itemID);

  let data = getDataFromItemID(evt.params._itemID, evt.address);
  log.debug("handleItemStatusChange: data = {}", [data.toHexString()]);

  if (curateItem === null) {
    log.error('handleItemStatusChange: CurateBase64AdItem with itemId {} not found for contentItemID {}', [
      itemID,
      evt.params._itemID.toHexString(),
    ]);
    return;
  }
  curateItem.contentStatus = getStatusFromItemID(curateItem.contentItemID, evt.address)
  log.debug("handleItemStatusChange: ItemID {} has status {} in contentCurate", [evt.params._itemID.toHexString(), curateItem.contentStatus])
  curateItem.save();
}