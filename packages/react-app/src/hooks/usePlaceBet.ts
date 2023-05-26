import { Interface } from '@ethersproject/abi'
import { BigNumber } from '@ethersproject/bignumber'
import { hexConcat, hexStripZeros, hexZeroPad, stripZeros } from '@ethersproject/bytes'
import { AddressZero, MaxInt256 } from '@ethersproject/constants'
import { Address } from '@wagmi/core'
import { useAccount, useBalance, useNetwork, UsePrepareContractWriteConfig } from 'wagmi'

import { ConnextBridgeFacetAbi } from '@/abi/ConnextBridgeFacet'
import { GnosisChainReceiverV2Abi } from '@/abi/GnosisChainReceiverV2'
import { MarketAbi } from '@/abi/Market'
import { Bytes } from '@/abi/types'
import { MultiOutcomeValues, SingleOutcomeValue } from '@/components/Bet/BetForm'
import { useEstimateRelayerFee } from '@/hooks/useEstimateRelayerFee'
import { DIVISOR } from '@/hooks/useMarketForm'
import { useTokenAllowance } from '@/hooks/useTokenAllowance'
import { GNOSIS_CHAIN_RECEIVER_ADDRESS, isMainChain, NetworkId } from '@/lib/config'
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
	hasFundsToBet: boolean
	betPrice: BigNumber
	betsCount: number
	approve?: { amount: BigNumber; token: Address; spender: Address }
}

type UsePreparePlaceBetFn = (
	marketId: Address,
	chainId: number,
	price: BigNumber,
	attribution: Address,
	results: BetResults[]
) => UsePlaceBetReturn
type UsePlaceBetFn = (
	marketId: Address,
	chainId: number,
	price: BigNumber,
	attribution: Address,
	outcomes: MultiOutcomeValues[]
) => UsePlaceBetReturn & { hasVoucher: boolean }

export const CROSS_CHAIN_TOKEN_ID = MaxInt256

const useHasFundsToBet = (betPrice: BigNumber | number, tokenAddress?: Address) => {
	if (tokenAddress === AddressZero) {
		// in the case of a crosschain voucher set the tokenAddress to undefined
		// it will then be ignored because tokenBalance.value.gte(betPrice) will always be true
		tokenAddress = undefined
	}

	const { address, connector } = useAccount()
	const { chain } = useNetwork()
	const { data: tokenBalance = { value: BigNumber.from(0) } } = useBalance({ address, token: tokenAddress })
	const { data: nativeBalance = { value: BigNumber.from(0) } } = useBalance({ address })

	const hasFundsForGas =
		connector && connector.id === 'sequence' && chain?.id === NetworkId.GNOSIS ? true : nativeBalance.value.gt(0)

	return tokenBalance.value.gte(betPrice) && hasFundsForGas
}

function hasValidResults(results: BetResults[]): results is Exclude<BetResults, false>[] {
	return typeof results.find((r) => r === false) === 'undefined'
}

const usePlaceBetWithMarket: UsePreparePlaceBetFn = (marketId, chainId, price, attribution, results) => {
	const betPrice = price.mul(results.length)

	const getTxParams = (
		chainId: number,
		attribution: Address,
		results: BetResults[]
	): UsePrepareContractWriteConfig<typeof MarketAbi, 'placeBets'> => {
		if (!hasValidResults(results)) {
			return {}
		}

		return {
			address: marketId,
			abi: MarketAbi,
			functionName: 'placeBets',
			args: [Array(results.length).fill(attribution), results],
			overrides: {
				value: betPrice,
			},
		}
	}

	const { isLoading, isSuccess, isError, error, write, receipt } = useSendTx(getTxParams(chainId, attribution, results))

	const ethersInterface = new Interface(MarketAbi)
	const events = parseEvents(receipt, marketId, ethersInterface)
	const tokenId = events ? events.filter((log) => log.name === 'PlaceBet')[0]?.args.tokenID || false : false

	const hasFundsToBet = useHasFundsToBet(betPrice)

	return {
		isLoading,
		isSuccess,
		isError,
		error,
		hasFundsToBet,
		betPrice,
		betsCount: results.length,
		placeBet: write,
		tokenId,
		hasVoucher: false,
		isCrossChainBet: false,
	}
}

const usePlaceBetCrossChain: UsePreparePlaceBetFn = (marketId, chainId, price, attribution, results) => {
	const betPrice = price.mul(results.length)
	const { address } = useAccount()
	const { data: { hasVoucher } = { hasVoucher: false } } = useHasVoucher(address, marketId, chainId, betPrice)

	let ASSET_ADDRESS: Address = AddressZero
	let daiAmount = BigNumber.from(0)

	if (!hasVoucher) {
		ASSET_ADDRESS = CROSS_CHAIN_CONFIG?.[chainId]?.DAI
		const extra = price.mul(DIVISOR).div(DIVISOR * 100)
		daiAmount = price.add(extra)
	}

	const CONNEXT_ADDRESS = CROSS_CHAIN_CONFIG?.[chainId]?.CONNEXT
	const DOMAIN_ID = CROSS_CHAIN_CONFIG?.[chainId]?.DOMAIN_ID

	const { data: allowance = BigNumber.from(0) } = useTokenAllowance(ASSET_ADDRESS, address, CONNEXT_ADDRESS)

	const { data: relayerFee } = useEstimateRelayerFee(DOMAIN_ID, GNOSIS_DOMAIN_ID)

	const approve: UsePlaceBetReturn['approve'] = allowance.lt(daiAmount)
		? { amount: daiAmount, token: ASSET_ADDRESS, spender: CONNEXT_ADDRESS }
		: undefined

	const getTxParams = (
		chainId: number,
		attribution: Address,
		results: BetResults[]
	): UsePrepareContractWriteConfig<typeof ConnextBridgeFacetAbi, 'xcall'> => {
		if (!hasValidResults(results) || !address || !relayerFee || typeof approve !== 'undefined') {
			return {}
		}

		const slippage = BigNumber.from(300) // 3%

		const numberOfBets = results.length
		const size = Math.max(...results[0].map((r) => stripZeros(r).length), 1)

		const calldata = hexConcat([
			address,
			marketId,
			attribution,
			BigNumber.from(size).toHexString(),
			BigNumber.from(numberOfBets).toHexString(),
			hexConcat(
				results.map((result) => hexConcat(result.map((r) => hexStripZeros(r)).map((r) => hexZeroPad(r, size))))
			),
		]) as Bytes

		return {
			address: CONNEXT_ADDRESS,
			abi: ConnextBridgeFacetAbi,
			functionName: 'xcall',
			args: [
				Number(GNOSIS_DOMAIN_ID),
				GNOSIS_CHAIN_RECEIVER_ADDRESS,
				ASSET_ADDRESS,
				address,
				daiAmount,
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

	const hasFundsToBet = useHasFundsToBet(daiAmount, ASSET_ADDRESS)

	return {
		isLoading,
		isSuccess,
		isError,
		error,
		hasFundsToBet,
		betPrice,
		betsCount: results.length,
		placeBet: write,
		tokenId,
		hasVoucher,
		approve,
		isCrossChainBet: true,
	}
}

const usePlaceBetWithVoucher: UsePreparePlaceBetFn = (marketId, chainId, price, attribution, results) => {
	const betPrice = price.mul(results.length)
	const { address } = useAccount()
	const { data: { hasVoucher } = { hasVoucher: false } } = useHasVoucher(address, marketId, chainId, betPrice)

	const getTxParams = (
		chainId: number,
		marketId: Address,
		attribution: Address,
		results: BetResults[]
	): UsePrepareContractWriteConfig<typeof GnosisChainReceiverV2Abi, 'placeBets'> => {
		if (!hasValidResults(results)) {
			return {}
		}

		return {
			address: GNOSIS_CHAIN_RECEIVER_ADDRESS,
			abi: GnosisChainReceiverV2Abi,
			functionName: 'placeBets',
			args: [marketId, attribution, results],
		}
	}

	const { isLoading, isSuccess, isError, error, write, receipt } = useSendTx(
		getTxParams(chainId, marketId, attribution, results)
	)

	const ethersInterface = new Interface(GnosisChainReceiverV2Abi)
	const events = parseEvents(receipt, GNOSIS_CHAIN_RECEIVER_ADDRESS, ethersInterface)
	const tokenId = events ? events.filter((log) => log.name === 'VoucherUsed')[0]?.args._tokenId || false : false

	const hasFundsToBet = useHasFundsToBet(0)

	return {
		isLoading,
		isSuccess,
		isError,
		error,
		hasFundsToBet,
		betPrice,
		betsCount: results.length,
		placeBet: write,
		tokenId,
		hasVoucher,
		isCrossChainBet: false,
	}
}

function getCombinations(
	outcomes: MultiOutcomeValues[],
	n = 0,
	outcomesCombinations: Array<SingleOutcomeValue[]> = [],
	current: SingleOutcomeValue[] = []
): Array<SingleOutcomeValue[]> {
	if (n === outcomes.length) {
		outcomesCombinations.push(current)
	} else {
		outcomes[n].values.forEach((item) =>
			getCombinations(outcomes, n + 1, outcomesCombinations, [
				...current,
				{ value: item, questionId: outcomes[n].questionId },
			])
		)
	}

	return outcomesCombinations
}

type BetResults = Bytes[] | false

function getResults(outcomes: SingleOutcomeValue[]): BetResults {
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

function getResultsCombinations(outcomes: MultiOutcomeValues[]): BetResults[] {
	return getCombinations(outcomes).map(getResults)
}

export const usePlaceBet: UsePlaceBetFn = (
	marketId: Address,
	chainId: number,
	price: BigNumber,
	attribution: Address,
	outcomes: MultiOutcomeValues[]
) => {
	const results = getResultsCombinations(outcomes)

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
