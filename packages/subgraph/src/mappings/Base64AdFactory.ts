import { Base64Ad } from '../types/schema';
import { NewAd } from '../types/Base64AdFactory/Base64AdFactory';


export function handleNewAd(event: NewAd): void {
    let base64Ad = new Base64Ad(event.params.ad.toHexString());
    base64Ad.markets = [];
    base64Ad.save()
}