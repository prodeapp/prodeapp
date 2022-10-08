import {useCall} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {SVG__factory} from "../typechain";

export const useSvgAd = (SVGAd: string) => {
  const { value: tokenUri } = useCall({ contract: new Contract(SVGAd, SVG__factory.createInterface()), method: 'getSVG', args: [SVGAd, 0] }) || {}

  if (tokenUri !== undefined) {
    return tokenUri[0];
  }

  return '';
};