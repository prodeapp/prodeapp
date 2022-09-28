import {useCall} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {SVGFactory__factory} from "../typechain";
import {useSubmissionDeposit} from "./useSubmissionDeposit";

const svgFactory = new Contract(process.env.REACT_APP_SVG_AD_FACTORY as string, SVGFactory__factory.createInterface());

export const useSVGAdFactoryDeposit = () => {
  const { value: technicalCurate } = useCall({ contract: svgFactory, method: 'technicalCurate', args: [] }) || {value: ['']}
  const { value: contentCurate } = useCall({ contract: svgFactory, method: 'contentCurate', args: [] }) || {value: ['']}
  const technicalCurateDeposit = useSubmissionDeposit(technicalCurate[0]);
  const contentCurateDeposit = useSubmissionDeposit(contentCurate[0]);

  return technicalCurateDeposit.add(contentCurateDeposit);
};