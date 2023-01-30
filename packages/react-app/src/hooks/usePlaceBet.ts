import {getAccount} from '@wagmi/core'
import {BigNumber} from "@ethersproject/bignumber";
import {Interface} from "@ethersproject/abi";
import {MarketAbi} from "../abi/Market";
import {VoucherManagerAbi} from "../abi/VoucherManager";
import {useContractReads} from "wagmi";
import {Address} from "@wagmi/core"
import {Bytes} from "../abi/types";
import {useSendTx} from "./useSendTx";
import {formatOutcome} from "../lib/reality";
import {BetFormValues} from "../components/Bet/BetForm";
import {TransactionReceipt} from "@ethersproject/abstract-provider";
import {LogDescription} from "@ethersproject/abi"

interface UsePlaceBetReturn {
  isLoading: boolean
  error: Error | null
  tokenId: BigNumber|false
  placeBet: ReturnType<typeof useSendTx>['write']
}

type UsePreparePlaceBetFn = (marketId: Address, price: BigNumber, attribution: Address, results: Bytes[] | false) => UsePlaceBetReturn;
type UsePlaceBetFn = (marketId: Address, price: BigNumber, attribution: Address, outcomes: BetFormValues['outcomes']) => UsePlaceBetReturn & {hasVoucher: boolean};

function parseEvents(receipt: TransactionReceipt | undefined, contractAddress: Address, contractInterface: Interface): LogDescription[] {
  return (receipt?.logs || []).reduce((accumulatedLogs, log) => {
    try {
      return log.address.toLowerCase() === contractAddress.toLowerCase()
        ? [...accumulatedLogs, contractInterface.parseLog(log)]
        : accumulatedLogs
    } catch (_err) {
      return accumulatedLogs
    }
  }, [] as LogDescription[])
}

const usePlaceBetWithMarket: UsePreparePlaceBetFn = (marketId: Address, price: BigNumber, attribution: Address, results: Bytes[] | false) => {
  const {isLoading, isSuccess, isError, error, write, receipt} = useSendTx({
    address: marketId,
    abi: MarketAbi,
    functionName: 'placeBet',
    args: [
      attribution,
      results ? results : [],
    ],
    overrides: {
      value: price
    },
    enabled: results !== false
  })

  const ethersInterface = new Interface(MarketAbi);
  const events = parseEvents(receipt, marketId, ethersInterface)
  const tokenId = events ? (events.filter(log => log.name === 'PlaceBet')[0]?.args.tokenID || false) : false

  return {isLoading, isSuccess, isError, error, placeBet: write, tokenId}
}

const usePlaceBetWithVoucher: UsePreparePlaceBetFn = (marketId: Address, price: BigNumber, attribution: Address, results: Bytes[] | false) => {
  const {isLoading, isSuccess, isError, error, write, receipt} = useSendTx({
    address: import.meta.env.VITE_VOUCHER_MANAGER as Address,
    abi: VoucherManagerAbi,
    functionName: 'placeBet',
    args: [
      marketId,
      attribution,
      results
    ],
    enabled: results !== false
  })

  const ethersInterface = new Interface(VoucherManagerAbi);
  const events = parseEvents(receipt, import.meta.env.VITE_VOUCHER_MANAGER as Address, ethersInterface)
  const tokenId = events ? (events.filter(log => log.name === 'VoucherUsed')[0]?.args._tokenId || false) : false

  return {isLoading, isSuccess, isError, error, placeBet: write, tokenId}
}

export const useHasVoucher = (address: Address | undefined, marketId: Address, price: BigNumber) => {
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

  return voucherBalance.gte(price) && marketWhitelisted
}

function getResults(outcomes: BetFormValues['outcomes']): Bytes[] | false {
  if (outcomes.length === 0 || typeof outcomes.find(o => o.value === '') !== 'undefined') {
    // false if there are missing predictions
    return false
  }

  return outcomes
    /**
     * ============================================================
     * THE RESULTS MUST BE SORTED BY QUESTION ID IN 'ascending' ORDER
     * OTHERWISE THE BETS WILL BE PLACED INCORRECTLY
     * ============================================================
     */
    .sort((a, b) => a.questionId > b.questionId ? 1 : -1)
    .map(outcome => formatOutcome(outcome.value));
}

export const usePlaceBet: UsePlaceBetFn = (marketId: Address, price: BigNumber, attribution: Address, outcomes: BetFormValues['outcomes']) => {
  const results = getResults(outcomes)

  const {address} = getAccount()
  const hasVoucher = useHasVoucher(address, marketId, price)
  const marketPlaceBet = usePlaceBetWithMarket(marketId, price, attribution, results);
  const voucherPlaceBet = usePlaceBetWithVoucher(marketId, price, attribution, results);

  // we need to keep track of the tokenId once a bet is placed using a voucher
  // because hookReturn changes to marketPlaceBet and the previous tokenId is lost
  let tokenId: BigNumber|false = false;

  if (marketPlaceBet.tokenId !== false) {
    tokenId = marketPlaceBet.tokenId;
  } else if (voucherPlaceBet.tokenId  !== false) {
    tokenId = voucherPlaceBet.tokenId;
  }

  return {
    isLoading: hasVoucher ? voucherPlaceBet.isLoading : marketPlaceBet.isLoading,
    error: hasVoucher ? voucherPlaceBet.error : marketPlaceBet.error,
    hasVoucher: hasVoucher,
    placeBet: hasVoucher ? voucherPlaceBet.placeBet : marketPlaceBet.placeBet,
    tokenId
  };
};