import { Interface } from '@ethersproject/abi'
import { BigNumber } from '@ethersproject/bignumber'
import { Address } from '@wagmi/core'
import { useAccount, UsePrepareContractWriteConfig } from 'wagmi'

import { MarketAbi } from '@/abi/Market'
import { Bytes } from '@/abi/types'
import { VoucherManagerAbi } from '@/abi/VoucherManager'
import { BetFormValues } from '@/components/Bet/BetForm'
import { KEY_VALUE_ADDRESSES, VOUCHER_MANAGER_ADDRESSES } from '@/lib/config'
import { parseEvents } from '@/lib/helpers'
import { formatOutcome } from '@/lib/reality'

import { useHasVoucher } from './useHasVoucher'
import { useSendTx } from './useSendTx'

interface UsePlaceBetReturn {
	isLoading: boolean
	error: Error | null
	tokenId: BigNumber | false
	placeBet: ReturnType<typeof useSendTx>['write']
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

const usePlaceBetWithMarket: UsePreparePlaceBetFn = (
	marketId: Address,
	chainId: number,
	price: BigNumber,
	attribution: Address,
	results: Bytes[] | false
) => {
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

	return { isLoading, isSuccess, isError, error, placeBet: write, tokenId }
}

const usePlaceBetWithVoucher: UsePreparePlaceBetFn = (
	marketId: Address,
	chainId: number,
	price: BigNumber,
	attribution: Address,
	results: Bytes[] | false
) => {
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
			address: VOUCHER_MANAGER_ADDRESSES[chainId as keyof typeof KEY_VALUE_ADDRESSES],
			abi: VoucherManagerAbi,
			functionName: 'placeBet',
			args: [marketId, attribution, results],
		}
	}

	const { isLoading, isSuccess, isError, error, write, receipt } = useSendTx(
		getTxParams(chainId, marketId, attribution, results)
	)

	const ethersInterface = new Interface(VoucherManagerAbi)
	const events = parseEvents(receipt, VOUCHER_MANAGER_ADDRESSES[chainId], ethersInterface)
	const tokenId = events ? events.filter((log) => log.name === 'VoucherUsed')[0]?.args._tokenId || false : false

	return { isLoading, isSuccess, isError, error, placeBet: write, tokenId }
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

	const { address } = useAccount()
	const hasVoucher = useHasVoucher(address, marketId, chainId, price)
	const marketPlaceBet = usePlaceBetWithMarket(marketId, chainId, price, attribution, results)
	const voucherPlaceBet = usePlaceBetWithVoucher(marketId, chainId, price, attribution, results)

	// we need to keep track of the tokenId once a bet is placed using a voucher
	// because hookReturn changes to marketPlaceBet and the previous tokenId is lost
	let tokenId: BigNumber | false = false

	if (marketPlaceBet.tokenId !== false) {
		tokenId = marketPlaceBet.tokenId
	} else if (voucherPlaceBet.tokenId !== false) {
		tokenId = voucherPlaceBet.tokenId
	}

	return {
		isLoading: hasVoucher ? voucherPlaceBet.isLoading : marketPlaceBet.isLoading,
		error: hasVoucher ? voucherPlaceBet.error : marketPlaceBet.error,
		hasVoucher: hasVoucher,
		placeBet: hasVoucher ? voucherPlaceBet.placeBet : marketPlaceBet.placeBet,
		tokenId,
	}
}
