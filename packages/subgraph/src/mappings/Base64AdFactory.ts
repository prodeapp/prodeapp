import { Base64Ad } from '../types/schema';
import { CreateAdCall, NewAd } from '../types/Base64AdFactory/Base64AdFactory';
import { getOrCreateBase64Ad } from './utils/helpers';


export function handleNewAd(event: NewAd): void {
    getOrCreateBase64Ad(event.params.ad.toHexString());

}

// export function handleCreateAd(call: CreateAdCall): void {
//     let base64Ad = new Base64Ad(call.outputs.value0.toHexString());
//     base64Ad.svg = call.inputs._svg;
//     base64Ad.markets = [];
//     base64Ad.save()
// }