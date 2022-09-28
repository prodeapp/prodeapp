import {useCall} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {useEffect, useState} from "react";
import {SVG__factory} from "../typechain";

export const useSvgAd = (SVGAd: string) => {
  // TODO: fix args
  const { value: tokenUri } = useCall({ contract: new Contract(SVGAd, SVG__factory.createInterface()), method: 'getSVG', args: [SVGAd, 0] }) || {}

  const [image, setImage] = useState('');

  useEffect(() => {
    if (tokenUri !== undefined) {
      setImage(atob(tokenUri[0]));
    }
  }, [tokenUri]);

  return image;
};