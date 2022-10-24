import { log, Address } from '@graphprotocol/graph-ts';
import { newItemMapped } from '../types/CurateProxySVG/CurateProxySVG';
import { SVGAd, CurateAdsMapper, CurateSVGAdItem } from '../types/schema';
import { getStatusFromItemID } from './GeneralizedTCR';
import { ContentCurateAddress, TechnicalCurateAddress } from './utils/constants';
import { getOrCreateSVGAd } from './utils/helpers';

export function handleNewItemMapped(event: newItemMapped): void {
    // for some reason, subgraph it's executing this event previous the BaseAd creation
    let svgAd = getOrCreateSVGAd(event.params._svgAddress.toHexString());
    let curateItem = new CurateSVGAdItem(event.params._itemID.toHexString());
    curateItem.SVGAd = svgAd.id;
    curateItem.contentItemID = event.params._contentItemID;
    curateItem.technicalItemID = event.params._technicalItemID;
    curateItem.contentStatus = getStatusFromItemID(curateItem.contentItemID, Address.fromBytes(ContentCurateAddress));
    curateItem.technicalStatus = getStatusFromItemID(curateItem.contentItemID, Address.fromBytes(TechnicalCurateAddress));
    curateItem.save()
    log.debug("handleNewItemMapped: Curation added for {}", [event.params._svgAddress.toHexString()]);

    svgAd.curateSVGAdItem = curateItem.id;
    svgAd.save()

}