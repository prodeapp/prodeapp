import { log } from '@graphprotocol/graph-ts';
import { Attribution } from '../types/schema';
import { ClaimReferralRewardCall, DistributeRewardsCall } from '../types/templates/Manager/Manager';
import { getAttributionID, getLastAttributionId, getOrCreateManager } from './utils/helpers';


export function handleClaimReferralReward(call: ClaimReferralRewardCall): void {
    let i = 0;
    const endId = getLastAttributionId(call.transaction.from.toHexString(), call.inputs._referral.toHexString())
        
    for (i; i<=endId; i++) {
        let attributionId = getAttributionID(call.transaction.from.toHexString(), call.inputs._referral.toHexString(), i)
        let attribution = Attribution.load(attributionId);
        if (attribution === null) {
            log.error("There is an error in getLastAttributionId for the call {}", [attributionId]);
            return
        }
        log.debug("handleClaimReferralReward: Attribution {} claimed", [attributionId])
        attribution.claimed = true;
        attribution.save();
    }
}

export function handleDistributeRewards(call: DistributeRewardsCall): void {
    let manager = getOrCreateManager(call.to);
    manager.claimed = true;
    manager.save()
    log.debug("handleDistributeRewards: Rewards for manager {} distributed", [manager.id]);
}