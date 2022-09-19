import { Base64Ad } from '../types/schema';
import { CreateAdCall, NewAd } from '../types/Base64AdFactory/Base64AdFactory';


export function handleNewAd(event: NewAd): void {
    let base64Ad = new Base64Ad(event.params.ad.toHexString());
    base64Ad.markets = [];
    base64Ad.save()
}

export function handleCreateAd(call: CreateAdCall): void {
    let base64Ad = new Base64Ad(call.outputs.value0.toHexString());
    base64Ad.svg = call.inputs._svg;
    base64Ad.markets = [];
    base64Ad.save()
}