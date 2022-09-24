import { log, Address } from '@graphprotocol/graph-ts';
import { newItemMapped } from '../types/CurateProxySVG/CurateProxySVG';
import { Base64Ad, CurateAdsMapper, CurateBase64AdItem } from '../types/schema';
import { getStatusFromItemID } from './GeneralizedTCR';
import { ContentCurateAddress, TechnicalCurateAddress } from './utils/constants';
import { getOrCreateBase64Ad } from './utils/helpers';

export function handleNewItemMapped(event: newItemMapped): void {
    // for some reason, subgraph it's executing this event previous the BaseAd creation
    let base64Ad = getOrCreateBase64Ad(event.params._svgAddress.toHexString());
    let curateItem = new CurateBase64AdItem(event.params._itemID.toHexString());
    curateItem.base64Ad = base64Ad.id;
    curateItem.contentItemID = event.params._contentItemID;
    curateItem.technicalItemID = event.params._technicalItemID;
    curateItem.contentStatus = getStatusFromItemID(curateItem.contentItemID, Address.fromBytes(ContentCurateAddress));
    curateItem.technicalStatus = getStatusFromItemID(curateItem.contentItemID, Address.fromBytes(TechnicalCurateAddress));
    curateItem.save()
    log.debug("handleNewItemMapped: Curation added for {}", [event.params._svgAddress.toHexString()]);

    base64Ad.curateBase64AdItem = curateItem.id;
    base64Ad.save()

    let curateMapperC = new CurateAdsMapper(event.params._contentItemID.toHexString())
    curateMapperC.curateBase64AdItem = curateItem.id;
    curateMapperC.save()

    let curateMapperT = new CurateAdsMapper(event.params._technicalItemID.toHexString())
    curateMapperT.curateBase64AdItem = curateItem.id;
    curateMapperT.save()
}