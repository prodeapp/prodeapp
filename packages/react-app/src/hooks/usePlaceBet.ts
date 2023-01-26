import {getAccount, prepareWriteContract, writeContract} from '@wagmi/core'
import {BigNumber, BigNumberish} from "@ethersproject/bignumber";
import {Interface} from "@ethersproject/abi";
import {MarketAbi} from "../abi/Market";
import {useState} from "react";
import {VoucherManagerAbi} from "../abi/VoucherManager";
import {useContractReads} from "wagmi";
import {Address} from "@wagmi/core"
import {Bytes} from "../abi/types";

interface UsePlaceBetReturn {
  isLoading: boolean
  error: Error | null
  tokenId: BigNumber|false
  placeBet: (_attribution: Address, _results: Bytes[]) => void/*Promise<TransactionReceipt | undefined>*/
  hasVoucher: boolean
}

type UsePlaceBetFn = (marketId: Address, price: BigNumberish) => UsePlaceBetReturn;

const placeBetWithMarket = async (marketId: Address, price: BigNumber, _attribution: Address, _results: Bytes[]): Promise<BigNumber> => {
  const config = await prepareWriteContract({
    address: marketId,
    abi: MarketAbi,
    functionName: 'placeBet',
    args: [
      _attribution,
      _results,
    ],
    overrides: {
      value: price
    }
  })
  const data = await writeContract(config)
  const receipt = await data.wait()

  const ethersInterface = new Interface(MarketAbi);
  const events = receipt.logs.map(i => ethersInterface.parseLog(i))
  return events ? (events.filter(log => log.name === 'PlaceBet')[0]?.args.tokenID || false) : false
}

const placeBetWithVoucher = async (marketId: string, _attribution: Address, _results: Bytes[]): Promise<BigNumber> => {
  const config = await prepareWriteContract({
    address: import.meta.env.VITE_VOUCHER_MANAGER as Address,
    abi: VoucherManagerAbi,
    functionName: 'placeBet',
    args: [
      marketId,
      _attribution,
      _results
    ],
  })
  const data = await writeContract(config)
  const receipt = await data.wait()

  const ethersInterface = new Interface(VoucherManagerAbi);
  const events = receipt.logs.map(i => ethersInterface.parseLog(i))
  return events ? (events.filter(log => log.name === 'VoucherUsed')[0]?.args._tokenId || false) : false
}

export const usePlaceBet: UsePlaceBetFn = (marketId: Address, price: BigNumberish) => {
  const {address} = getAccount()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [tokenId, setTokenId] = useState<BigNumber|false>(false)

  const {data} = useContractReads({
    contracts: [
      {
        address: import.meta.env.VITE_VOUCHER_MANAGER as Address,
        abi: VoucherManagerAbi,
        functionName: 'balance',
        args: [address],
      },
      {
        address: import.meta.env.VITE_VOUCHER_MANAGER as Address,
        abi: VoucherManagerAbi,
        functionName: 'marketsWhitelist',
        args: [marketId],
      },
    ]
  })

  const [voucherBalance, marketWhitelisted] = [data?.[0] || BigNumber.from(0), data?.[1] || false] as [BigNumber, boolean]

  const hasVoucher = voucherBalance.gte(price) && marketWhitelisted

  const placeBet = async (_attribution: Address, _results: Bytes[]) => {
    setIsLoading(true)

    try {
      if (hasVoucher) {
        setTokenId(await placeBetWithVoucher(marketId, _attribution, _results))
      } else {
        setTokenId(await placeBetWithMarket(marketId, BigNumber.from(price), _attribution, _results))
      }
    } catch (e: any) {
      setError(e)
    }

    setIsLoading(false)
  }

  return {
    isLoading,
    error,
    hasVoucher,
    placeBet,
    tokenId
  };
};