import {useCall} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {useEffect, useState} from "react";
import {Base64Ad__factory} from "../typechain";

export const useSvgAd = (base64Ad: string) => {
  // TODO: fix args
  const { value: tokenUri } = useCall({ contract: new Contract(base64Ad, Base64Ad__factory.createInterface()), method: 'getSVG', args: [base64Ad, 0] }) || {}

  const [image, setImage] = useState('');

  useEffect(() => {
    if (tokenUri !== undefined) {
      setImage(atob(tokenUri[0]));
    }
  }, [tokenUri]);

  return image;
};