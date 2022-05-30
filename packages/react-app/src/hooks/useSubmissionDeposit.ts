import {useCall} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {Arbitrator__factory, GeneralizedTCR__factory} from "../typechain";
import {BigNumber} from "@ethersproject/bignumber";

const generalizedTCR = new Contract(process.env.REACT_APP_CURATE_REGISTRY as string, GeneralizedTCR__factory.createInterface());

export const useSubmissionDeposit = () => {
  const { value: arbitrator } = useCall({ contract: generalizedTCR, method: 'arbitrator', args: [] }) || {}
  const { value: arbitratorExtraData } = useCall({ contract: generalizedTCR, method: 'arbitratorExtraData', args: [] }) || {}
  const { value: submissionBaseDeposit } = useCall({ contract: generalizedTCR, method: 'submissionBaseDeposit', args: [] }) || {value: [BigNumber.from(0)]}
  const { value: arbitrationCost } = useCall(arbitrator && arbitratorExtraData && { contract: new Contract(arbitrator[0], Arbitrator__factory.createInterface()), method: 'arbitrationCost', args: [arbitratorExtraData[0]] }) || {value: [BigNumber.from(0)]}

  return submissionBaseDeposit[0].add(arbitrationCost[0]);
};