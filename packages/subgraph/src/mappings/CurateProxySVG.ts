import { log, BigInt, Address, dataSource } from '@graphprotocol/graph-ts';
import { newItemMapped } from '../types/CurateProxySVG/CurateProxySVG';
import { CurateBase64AdItem, CurateItem } from '../types/schema';

export function handleNewItemMapped(event: newItemMapped) {
    let curateItem = new CurateBase64AdItem(event.params._itemID.toHexString());
    curateItem.addressAd = event.params._svgAddress;
    curateItem.contentItemID = event.params._contentItemID;
    curateItem.technicalItemID = event.params._technicalItemID;
    curateItem.contentStatus = "Absent";  // TODO: add actual status
    curateItem.technicalStatus = "Absent";  // TODO: add actual status
    curateItem.save()
    log.debug("handleNewItemMapped: Curation added for {}", [event.params._svgAddress.toHexString()]);
}