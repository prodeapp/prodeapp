import {BigNumber} from "@ethersproject/bignumber";
import {useQuery} from "@tanstack/react-query";
import {getContract, getProvider} from "@wagmi/core";
import {MarketAbi} from "../abi/Market";

export const useBetToken = (marketId: string, tokenId: BigNumber) => {
  return useQuery<string, Error>(
    ["useBetToken", marketId, tokenId],
    async () => {
      const contract = getContract({
        address: marketId,
        abi: MarketAbi,
        signerOrProvider: getProvider(),
      })

      const tokenUri = await contract.tokenURI(tokenId)

      if (tokenUri !== undefined) {
        const data = JSON.parse(atob(tokenUri.split(',')[1]));
        return data.image
      }

      return ''
    }, {
      enabled: !!marketId && !!tokenId
    }
  );
};