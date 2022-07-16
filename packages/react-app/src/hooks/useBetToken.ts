import {useCall} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {BigNumber} from "@ethersproject/bignumber";
import {useEffect, useState} from "react";
import {Market__factory} from "../typechain";

export const useBetToken = (marketId: string, tokenId: BigNumber) => {
  const { value: tokenUri } = useCall({ contract: new Contract(marketId, Market__factory.createInterface()), method: 'tokenURI', args: [tokenId] }) || {}

  const [image, setImage] = useState('');

  useEffect(() => {
    if (tokenUri !== undefined) {
      const data = JSON.parse(atob(tokenUri[0].split(',')[1]));
      setImage(data.image);
    }
  }, [tokenUri]);

  return image;
};