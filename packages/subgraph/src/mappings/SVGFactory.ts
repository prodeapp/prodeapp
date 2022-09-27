import { NewAd } from '../types/SVGFactory/SVGFactory';
import { getOrCreateSVGAd } from './utils/helpers';


export function handleNewAd(event: NewAd): void {
    getOrCreateSVGAd(event.params.ad.toHexString());

}