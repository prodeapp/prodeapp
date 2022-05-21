import { Tournament } from "../types/schema";
import { NewItem } from '../types/LightCurate/LightGeneralizedTCR';
import { log } from "@graphprotocol/graph-ts";

export function handleNewItem(event: NewItem): void {
    log.info("handleNewItem: {}", [event.params._data.toString()]);
}