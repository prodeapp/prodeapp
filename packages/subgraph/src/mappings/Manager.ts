import { log } from '@graphprotocol/graph-ts';
import { Attribution } from '../types/schema';
import { ClaimReferralRewardCall, DistributeRewardsCall } from '../types/templates/Manager/Manager';
import { getAttributionID, getOrCreateManager } from './utils/helpers';


export function handleClaimReferralReward(call: ClaimReferralRewardCall): void {
    let i = 0;
    let attributionId = getAttributionID(call.transaction.from, call.inputs._referral, i.toString())
    let attribution = Attribution.load(attributionId);
    while (attribution !== null) {
        log.debug("handleClaimReferralReward: Attribution {} claimed", [attributionId])
        attribution.claimed = true;
        attribution.save()
        i++
        attributionId = getAttributionID(call.transaction.from, call.inputs._referral, i.toString())
        attribution = Attribution.load(attributionId);
    }
}

export function handleDistributeRewards(call: DistributeRewardsCall): void {
    let manager = getOrCreateManager(call.to);
    manager.claimed = true;
    manager.save()
    log.debug("handleDistributeRewards: Rewards for manager {} distributed", [manager.id]);
}