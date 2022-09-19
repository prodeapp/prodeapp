import { log } from '@graphprotocol/graph-ts';
import { newItemMapped } from '../types/CurateProxySVG/CurateProxySVG';
import { Base64Ad, CurateBase64AdItem } from '../types/schema';

export function handleNewItemMapped(event: newItemMapped) {
    let base64Ad = Base64Ad.load(event.params._svgAddress.toHexString())!;
    let curateItem = new CurateBase64AdItem(event.params._itemID.toHexString());
    curateItem.base64Ad = base64Ad.id;
    curateItem.contentItemID = event.params._contentItemID;
    curateItem.technicalItemID = event.params._technicalItemID;
    curateItem.contentStatus = "Absent";  // TODO: add actual status
    curateItem.technicalStatus = "Absent";  // TODO: add actual status
    curateItem.save()
    log.debug("handleNewItemMapped: Curation added for {}", [event.params._svgAddress.toHexString()]);

    base64Ad.curateBase64AdItem = curateItem.id;
    base64Ad.save()
}