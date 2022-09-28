import {useCall} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {Arbitrator__factory, GeneralizedTCR__factory} from "../typechain";
import {BigNumber} from "@ethersproject/bignumber";

export const useSubmissionDeposit = (tcrAddress: string) => {
  const generalizedTCR = tcrAddress !== '' ? new Contract(tcrAddress, GeneralizedTCR__factory.createInterface()) : false;
  const { value: arbitrator } = useCall(generalizedTCR && { contract: generalizedTCR, method: 'arbitrator', args: [] }) || {}
  const { value: arbitratorExtraData } = useCall(generalizedTCR &&{ contract: generalizedTCR, method: 'arbitratorExtraData', args: [] }) || {}
  const { value: submissionBaseDeposit } = useCall(generalizedTCR && { contract: generalizedTCR, method: 'submissionBaseDeposit', args: [] }) || {value: [BigNumber.from(0)]}
  const { value: arbitrationCost } = useCall(arbitrator && arbitratorExtraData && { contract: new Contract(arbitrator[0], Arbitrator__factory.createInterface()), method: 'arbitrationCost', args: [arbitratorExtraData[0]] }) || {value: [BigNumber.from(0)]}

  return submissionBaseDeposit[0].add(arbitrationCost[0]);
};