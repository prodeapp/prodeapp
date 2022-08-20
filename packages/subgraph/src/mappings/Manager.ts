import { log } from '@graphprotocol/graph-ts';
import { Attribution } from '../types/schema';
import { ClaimReferralRewardCall, DistributeRewardsCall } from '../types/templates/Manager/Manager';
import { Manager } from '../types/templates/Market/Manager';
import { getOrCreateManager, getOrCreateMarketReferral } from './utils/helpers';


export function handleClaimReferralReward(call: ClaimReferralRewardCall): void {
    let managerSC = Manager.bind(call.to);
    let market = managerSC.market();
    let mr = getOrCreateMarketReferral(market.toHexString() ,call.inputs._referral.toHexString(), call.to.toHexString())
    let attributions = mr.attributions;
    mr.claimed = true;
    mr.save();
    
    attributions.forEach((attributionId) => {
        let attribution = Attribution.load(attributionId);
        if (attribution === null ) return;
        attribution.claimed = true;
        attribution.save()
        // log.debug("handleClaimReferralReward: Attribution {} claimed", [attributionId])
    })
}

export function handleDistributeRewards(call: DistributeRewardsCall): void {
    let manager = getOrCreateManager(call.to);
    manager.claimed = true;
    manager.save()
    log.info("handleDistributeRewards: Rewards for manager {} distributed", [manager.id]);
}