import {TransactionStatus, useCall, useContractFunction, useEthers} from "@usedapp/core";
import {Contract} from "@ethersproject/contracts";
import {Market__factory, VoucherManager__factory} from "../typechain";
import {BytesLike} from "ethers";
import {BigNumber, BigNumberish} from "@ethersproject/bignumber";
import {TransactionReceipt} from "@ethersproject/providers";
import {useEffect, useState} from "react";

interface UsePlaceBetReturn {
  state: TransactionStatus
  tokenId: BigNumber|false
  placeBet: (_marketFactory: string, _marketIndex: BigNumberish, _attribution: string, _results: BytesLike[]) => Promise<TransactionReceipt | undefined>
  hasVoucher: boolean
}

type UsePlaceBetFn = (marketId: string, price: BigNumberish) => UsePlaceBetReturn;

const useMarketPlaceBet: UsePlaceBetFn = (marketId: string, price: BigNumberish) => {
  const { state, send, events } = useContractFunction(
    new Contract(marketId, Market__factory.createInterface()),
    'placeBet'
  );

  const [tokenId, setTokenId] = useState<BigNumber|false>(false);

  useEffect(()=> {
    if (events) {
      setTokenId(events.filter(log => log.name === 'PlaceBet')[0]?.args.tokenID || false);
    }
  }, [events])
  
  const placeBet = async (_marketFactory: string, _marketIndex: BigNumberish, _attribution: string, _results: BytesLike[]) => {
    return await send(
      _attribution,
      _results,
      {
        value: price
      }
    );
  }

  return {
    state,
    tokenId,
    placeBet,
    hasVoucher: false
  }
}

const useVoucherPlaceBet: UsePlaceBetFn = (marketId: string, price: BigNumberish) => {
  const { account } = useEthers();

  const contract = new Contract(process.env.REACT_APP_VOUCHER_MANAGER as string, VoucherManager__factory.createInterface());

  const { state, send, events } = useContractFunction(
    contract,
    'placeBet'
  );

  const [hasVoucher, setHasVoucher] = useState(false);

  const { value: voucherBalance } = useCall({ contract, method: 'balance', args: [account] }) || {value: [BigNumber.from(0)]}

  useEffect(() => {
    setHasVoucher(voucherBalance[0].gte(price))
  }, [voucherBalance, price]);

  const [tokenId, setTokenId] = useState<BigNumber|false>(false);

  useEffect(()=> {
    if (events) {
      setTokenId(events.filter(log => log.name === 'VoucherUsed')[0]?.args._tokenId || false);
    }
  }, [events])

  const placeBet = async (_marketFactory: string, _marketIndex: BigNumberish, _attribution: string, _results: BytesLike[]) => {
    return await send(
      _marketFactory,
      _marketIndex,
      _attribution,
      _results
    );
  }

  return {
    state,
    tokenId,
    placeBet,
    hasVoucher,
  }
}

export const usePlaceBet: UsePlaceBetFn = (marketId: string, price: BigNumberish) => {
  const marketPlaceBet = useMarketPlaceBet(marketId, price);
  const voucherPlaceBet = useVoucherPlaceBet(marketId, price);

  // we need to keep track of the tokenId once a bet is placed using a voucher
  // because hookReturn changes to marketPlaceBet and the previous tokenId is lost
  const [tokenId, setTokenId] = useState<BigNumber|false>(false);

  useEffect(() => {
    if (marketPlaceBet.tokenId !== false) {
      setTokenId(marketPlaceBet.tokenId)
    } else if (voucherPlaceBet.tokenId  !== false) {
      setTokenId(voucherPlaceBet.tokenId)
    }
  }, [marketPlaceBet.tokenId, voucherPlaceBet.tokenId]);

  return {
    state: voucherPlaceBet.hasVoucher ? voucherPlaceBet.state : marketPlaceBet.state,
    hasVoucher: voucherPlaceBet.hasVoucher,
    placeBet: voucherPlaceBet.hasVoucher ? voucherPlaceBet.placeBet : marketPlaceBet.placeBet,
    tokenId
  };
};