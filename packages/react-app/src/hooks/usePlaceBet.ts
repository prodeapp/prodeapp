import { Interface } from '@ethersproject/abi'
import { BigNumber } from '@ethersproject/bignumber'
import { hexConcat, hexStripZeros, hexZeroPad, stripZeros } from '@ethersproject/bytes'
import { keccak256 } from '@ethersproject/solidity'
import { Address } from '@wagmi/core'
import { useAccount, UsePrepareContractWriteConfig } from 'wagmi'

import { ConnextBridgeFacetAbi } from '@/abi/ConnextBridgeFacet'
import { MarketAbi } from '@/abi/Market'
import { Bytes } from '@/abi/types'
import { VoucherManagerAbi } from '@/abi/VoucherManager'
import { BetFormValues } from '@/components/Bet/BetForm'
import { CROSSCHAIN_CONFIG, getConfigAddress, isMainChain } from '@/lib/config'
import { parseEvents } from '@/lib/helpers'
import { formatOutcome } from '@/lib/reality'

import { useHasVoucher } from './useHasVoucher'
import { useSendTx } from './useSendTx'

interface UsePlaceBetReturn {
	isLoading: boolean
	error: Error | null
	tokenId: BigNumber | false
	placeBet: ReturnType<typeof useSendTx>['write']
	hasVoucher: boolean
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
	const tokenId = events ? events.filter(log => log.name === 'PlaceBet')[0]?.args.tokenID || false : false

	return { isLoading, isSuccess, isError, error, placeBet: write, tokenId, hasVoucher: false }
}

const usePlaceBetCrossChain: UsePreparePlaceBetFn = (marketId, chainId, price, attribution, results) => {
	const { address } = useAccount()

	const getTxParams = (
		chainId: number,
		attribution: Address,
		results: Bytes[] | false
	): UsePrepareContractWriteConfig<typeof ConnextBridgeFacetAbi, 'xcall'> => {
		if (results === false || !address) {
			return {}
		}

		const GNOSIS_DOMAIN_ID = 6778479
		const RECEIVER_CONTRACT = '0x348F2706AE7D647461Ce90f9E3569014E7d135Dc'
		const slippage = BigNumber.from(100) // 1%
		const amount = price // TODO

		const size = Math.max(...results.map(r => stripZeros(r).length), 1)

		const calldata = keccak256(
			['address', 'address', 'address', 'uint8', 'bytes'],
			[
				address,
				marketId,
				attribution,
				BigNumber.from(size),
				hexConcat(results.map(r => hexStripZeros(r)).map(r => hexZeroPad(r, size))),
			]
		) as Bytes

		const relayerFee = BigNumber.from(0) // TODO

		return {
			address: CROSSCHAIN_CONFIG[chainId].CONNEXT,
			abi: ConnextBridgeFacetAbi,
			functionName: 'xcall',
			args: [GNOSIS_DOMAIN_ID, RECEIVER_CONTRACT, CROSSCHAIN_CONFIG[chainId].USDC, address, amount, slippage, calldata],
			overrides: {
				value: relayerFee,
			},
		}
	}

	const { isLoading, isSuccess, isError, error, write, receipt } = useSendTx(getTxParams(chainId, attribution, results))

	// TODO
	const ethersInterface = new Interface(MarketAbi)
	const events = parseEvents(receipt, marketId, ethersInterface)
	const tokenId = events ? events.filter(log => log.name === 'PlaceBet')[0]?.args.tokenID || false : false

	return { isLoading, isSuccess, isError, error, placeBet: write, tokenId, hasVoucher: false }
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
	const tokenId = events ? events.filter(log => log.name === 'VoucherUsed')[0]?.args._tokenId || false : false

	return { isLoading, isSuccess, isError, error, placeBet: write, tokenId, hasVoucher }
}

function getResults(outcomes: BetFormValues['outcomes']): Bytes[] | false {
	if (outcomes.length === 0 || typeof outcomes.find(o => o.value === '') !== 'undefined') {
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
			.map(outcome => formatOutcome(outcome.value))
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
