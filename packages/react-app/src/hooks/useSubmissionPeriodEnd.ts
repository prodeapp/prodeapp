import {useCall} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {Market__factory} from "../typechain";

export const useSubmissionPeriodEnd = (marketId: string) => {
  const market = new Contract(marketId, Market__factory.createInterface());

  const { value: resultSubmissionPeriodStart } = useCall({ contract: market, method: 'resultSubmissionPeriodStart', args: [] }) || {}
  const { value: submissionTimeout } = useCall({ contract: market, method: 'submissionTimeout', args: [] }) || {}

  if (
    !resultSubmissionPeriodStart || resultSubmissionPeriodStart[0].eq(0) || !submissionTimeout
  ) {
    return 0
  }

  return resultSubmissionPeriodStart[0].add(submissionTimeout[0]).toNumber();
}