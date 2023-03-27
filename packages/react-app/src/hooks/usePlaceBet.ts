import { Interface } from '@ethersproject/abi'
import { BigNumber } from '@ethersproject/bignumber'
import { hexConcat, hexStripZeros, hexZeroPad, stripZeros } from '@ethersproject/bytes'
import { MaxInt256 } from '@ethersproject/constants'
import { Address } from '@wagmi/core'
import { useAccount, UsePrepareContractWriteConfig } from 'wagmi'

import { ConnextBridgeFacetAbi } from '@/abi/ConnextBridgeFacet'
import { MarketAbi } from '@/abi/Market'
import { Bytes } from '@/abi/types'
import { VoucherManagerAbi } from '@/abi/VoucherManager'
import { BetFormValues } from '@/components/Bet/BetForm'
import { useEstimateRelayerFee } from '@/hooks/useEstimateRelayerFee'
import { DIVISOR } from '@/hooks/useMarketForm'
import { useTokenAllowance } from '@/hooks/useTokenAllowance'
import { getConfigAddress, GNOSIS_CHAIN_RECEIVER_ADDRESS, isMainChain } from '@/lib/config'
import { CROSS_CHAIN_CONFIG, GNOSIS_DOMAIN_ID } from '@/lib/connext'
import { parseEvents } from '@/lib/helpers'
import { formatOutcome } from '@/lib/reality'

import { useHasVoucher } from './useHasVoucher'
import { useSendTx } from './useSendTx'

export interface UsePlaceBetReturn {
	isLoading: boolean
	error: Error | null
	tokenId: BigNumber | false
	placeBet: ReturnType<typeof useSendTx>['write']
	hasVoucher: boolean
	isCrossChainBet: boolean
	approve?: { amount: BigNumber; token: Address; spender: Address }
}

type UsePreparePlaceBetFn = (
	marketId: Address,
	chainId: number,
	price: BigNumber,
	attribution: Address,
	results: Bytes[] | false
) => UsePlaceBetReturn
type UsePlaceBetFn = (
	marketId: Address,
	chainId: number,
	price: BigNumber,
	attribution: Address,
	outcomes: BetFormValues['outcomes']
) => UsePlaceBetReturn & { hasVoucher: boolean }

export const CROSS_CHAIN_TOKEN_ID = MaxInt256

const usePlaceBetWithMarket: UsePreparePlaceBetFn = (marketId, chainId, price, attribution, results) => {
	const getTxParams = (
		chainId: number,
		attribution: Address,
		results: Bytes[] | false
	): UsePrepareContractWriteConfig<typeof MarketAbi, 'placeBet'> => {
		if (results === false) {
			return {}
		}

		return {
			address: marketId,
			abi: MarketAbi,
			functionName: 'placeBet',
			args: [attribution, results],
			overrides: {
				value: price,
			},
		}
	}

	const { isLoading, isSuccess, isError, error, write, receipt } = useSendTx(getTxParams(chainId, attribution, results))

	const ethersInterface = new Interface(MarketAbi)
	const events = parseEvents(receipt, marketId, ethersInterface)
	const tokenId = events ? events.filter((log) => log.name === 'PlaceBet')[0]?.args.tokenID || false : false

	return { isLoading, isSuccess, isError, error, placeBet: write, tokenId, hasVoucher: false, isCrossChainBet: false }
}

const usePlaceBetCrossChain: UsePreparePlaceBetFn = (marketId, chainId, price, attribution, results) => {
	const { address } = useAccount()

	// fix the difference of decimals
	const priceInUsdc = price.div(10 ** (18 - 6))
	const extra = priceInUsdc.mul(DIVISOR).div(DIVISOR * 100)
	const usdcAmount = priceInUsdc.add(extra)

	const USDC_ADDRESS = CROSS_CHAIN_CONFIG?.[chainId]?.USDC
	const CONNEXT_ADDRESS = CROSS_CHAIN_CONFIG?.[chainId]?.CONNEXT
	const DOMAIN_ID = CROSS_CHAIN_CONFIG?.[chainId]?.DOMAIN_ID

	const { data: allowance = BigNumber.from(0) } = useTokenAllowance(USDC_ADDRESS, address, CONNEXT_ADDRESS)

	const { data: relayerFee } = useEstimateRelayerFee(DOMAIN_ID, GNOSIS_DOMAIN_ID)

	const getTxParams = (
		chainId: number,
		attribution: Address,
		results: Bytes[] | false
	): UsePrepareContractWriteConfig<typeof ConnextBridgeFacetAbi, 'xcall'> => {
		if (results === false || !address || !relayerFee) {
			return {}
		}

		const slippage = BigNumber.from(300) // 3%

		const size = Math.max(...results.map((r) => stripZeros(r).length), 1)

		const calldata = hexConcat([
			address,
			marketId,
			attribution,
			BigNumber.from(size).toHexString(),
			hexConcat(results.map((r) => hexStripZeros(r)).map((r) => hexZeroPad(r, size))),
		]) as Bytes

		return {
			address: CONNEXT_ADDRESS,
			abi: ConnextBridgeFacetAbi,
			functionName: 'xcall',
			args: [
				Number(GNOSIS_DOMAIN_ID),
				GNOSIS_CHAIN_RECEIVER_ADDRESS,
				USDC_ADDRESS,
				address,
				usdcAmount,
				slippage,
				calldata,
			],
			overrides: {
				value: relayerFee,
			},
		}
	}

	const { isLoading, isSuccess, isError, error, write, receipt } = useSendTx(getTxParams(chainId, attribution, results))

	const ethersInterface = new Interface(ConnextBridgeFacetAbi)
	const events = parseEvents(receipt, CONNEXT_ADDRESS, ethersInterface)
	const transferId = events ? events.filter((log) => log.name === 'XCalled')[0]?.args?.transferId || false : false
	const tokenId = transferId ? CROSS_CHAIN_TOKEN_ID : false

	const approve = allowance.lt(usdcAmount)
		? { amount: usdcAmount, token: USDC_ADDRESS, spender: CONNEXT_ADDRESS }
		: undefined

	return {
		isLoading,
		isSuccess,
		isError,
		error,
		placeBet: write,
		tokenId,
		hasVoucher: false,
		approve,
		isCrossChainBet: true,
	}
}

const usePlaceBetWithVoucher: UsePreparePlaceBetFn = (marketId, chainId, price, attribution, results) => {
	const { address } = useAccount()
	const hasVoucher = useHasVoucher(address, marketId, chainId, price)

	const getTxParams = (
		chainId: number,
		marketId: Address,
		attribution: Address,
		results: Bytes[] | false
	): UsePrepareContractWriteConfig<typeof VoucherManagerAbi, 'placeBet'> => {
		if (results === false) {
			return {}
		}

		return {
			address: getConfigAddress('VOUCHER_MANAGER', chainId),
			abi: VoucherManagerAbi,
			functionName: 'placeBet',
			args: [marketId, attribution, results],
		}
	}

	const { isLoading, isSuccess, isError, error, write, receipt } = useSendTx(
		getTxParams(chainId, marketId, attribution, results)
	)

	const ethersInterface = new Interface(VoucherManagerAbi)
	const events = parseEvents(receipt, getConfigAddress('VOUCHER_MANAGER', chainId), ethersInterface)
	const tokenId = events ? events.filter((log) => log.name === 'VoucherUsed')[0]?.args._tokenId || false : false

	return { isLoading, isSuccess, isError, error, placeBet: write, tokenId, hasVoucher, isCrossChainBet: false }
}

function getResults(outcomes: BetFormValues['outcomes']): Bytes[] | false {
	if (outcomes.length === 0 || typeof outcomes.find((o) => o.value === '') !== 'undefined') {
		// false if there are missing predictions
		return false
	}

	return (
		outcomes
			/**
			 * ============================================================
			 * THE RESULTS MUST BE SORTED BY QUESTION ID IN 'ascending' ORDER
			 * OTHERWISE THE BETS WILL BE PLACED INCORRECTLY
			 * ============================================================
			 */
			.sort((a, b) => (a.questionId > b.questionId ? 1 : -1))
			.map((outcome) => formatOutcome(outcome.value))
	)
}

export const usePlaceBet: UsePlaceBetFn = (
	marketId: Address,
	chainId: number,
	price: BigNumber,
	attribution: Address,
	outcomes: BetFormValues['outcomes']
) => {
	const results = getResults(outcomes)

	const marketPlaceBet = usePlaceBetWithMarket(marketId, chainId, price, attribution, results)
	const crossChainPlaceBet = usePlaceBetCrossChain(marketId, chainId, price, attribution, results)
	const voucherPlaceBet = usePlaceBetWithVoucher(marketId, chainId, price, attribution, results)

	// we need to keep track of the tokenId once a bet is placed using a voucher
	// because hookReturn changes to marketPlaceBet and the previous tokenId is lost
	let tokenId: BigNumber | false = false

	if (marketPlaceBet.tokenId !== false) {
		tokenId = marketPlaceBet.tokenId
	} else if (voucherPlaceBet.tokenId !== false) {
		tokenId = voucherPlaceBet.tokenId
	} else if (crossChainPlaceBet.tokenId !== false) {
		tokenId = crossChainPlaceBet.tokenId
	}

	let activeHook: UsePlaceBetReturn

	if (!isMainChain(chainId)) {
		activeHook = crossChainPlaceBet
	} else if (voucherPlaceBet.hasVoucher) {
		activeHook = voucherPlaceBet
	} else {
		activeHook = marketPlaceBet
	}

	return { ...activeHook, tokenId }
}
