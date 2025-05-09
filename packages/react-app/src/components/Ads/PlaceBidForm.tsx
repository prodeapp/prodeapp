import { parseUnits } from '@ethersproject/units'
import { ErrorMessage } from '@hookform/error-message'
import { t } from '@lingui/macro'
import { Trans } from '@lingui/macro'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import FormHelperText from '@mui/material/FormHelperText'
import TextField from '@mui/material/TextField'
import { Address } from '@wagmi/core'
import React, { useEffect } from 'react'
import { FieldErrors } from 'react-hook-form/dist/types/errors'
import { UseFormHandleSubmit, UseFormRegister, UseFormWatch } from 'react-hook-form/dist/types/form'
import { useAccount, useContractRead, useNetwork } from 'wagmi'

import { FirstPriceAuctionAbi } from '@/abi/FirstPriceAuction'
import { Bytes } from '@/abi/types'
import { BoxRow, BoxWrapper, FormError } from '@/components'
import { useSendRecklessTx } from '@/hooks/useSendTx'
import { filterChainId, getConfigAddress, getConfigString } from '@/lib/config'

export type PlaceBidFormValues = {
	market: Address | ''
	bid: string
	bidPerSecond: string
}

type PlaceBidFormProps = {
	itemId: Bytes
	currentBid: string
	register: UseFormRegister<PlaceBidFormValues>
	errors: FieldErrors<PlaceBidFormValues>
	watch: UseFormWatch<PlaceBidFormValues>
	handleSubmit: UseFormHandleSubmit<PlaceBidFormValues>
	setShowActions: (showActions: boolean) => void
}

export default function PlaceBidForm({
	itemId,
	currentBid,
	register,
	errors,
	watch,
	handleSubmit,
	setShowActions,
}: PlaceBidFormProps) {
	const { chain } = useNetwork()
	const { address } = useAccount()

	const { isLoading, isSuccess, error, write } = useSendRecklessTx({
		address: getConfigAddress('FIRST_PRICE_AUCTION', chain?.id),
		abi: FirstPriceAuctionAbi,
		functionName: 'placeBid',
	})

	const { data: MIN_OFFER_DURATION } = useContractRead({
		address: getConfigAddress('FIRST_PRICE_AUCTION', chain?.id),
		abi: FirstPriceAuctionAbi,
		functionName: 'MIN_OFFER_DURATION',
		chainId: filterChainId(chain?.id),
	})

	useEffect(() => {
		if (!address || !chain || chain.unsupported) {
			setShowActions(false)
			return
		}

		setShowActions(!isSuccess)
	}, [isSuccess, address, chain, setShowActions])

	const bid = watch('bid')

	const validBid = (bidPerSecond: string) => {
		if (!bidPerSecond || !MIN_OFFER_DURATION || MIN_OFFER_DURATION.eq(0)) {
			return false
		}

		return (Number(bid) + Number(currentBid)) / Number(bidPerSecond) > MIN_OFFER_DURATION.toNumber()
	}

	if (!chain || chain.unsupported) {
		return (
			<Alert severity='error'>
				<Trans>UNSUPPORTED_CHAIN</Trans>
			</Alert>
		)
	}

	if (isSuccess) {
		return (
			<Alert severity='success'>
				<Trans>Bid placed.</Trans>
			</Alert>
		)
	}

	const onSubmit = async (data: PlaceBidFormValues) => {
		write!({
			recklesslySetUnpreparedArgs: [itemId, data.market as Address, parseUnits(data.bidPerSecond, 18)],
			recklesslySetUnpreparedOverrides: {
				value: parseUnits(data.bid, 18),
			},
		})
	}

	const isEdit = currentBid !== '0'

	return (
		<form onSubmit={handleSubmit(onSubmit)} id='place-bid-form'>
			{isLoading && (
				<div style={{ textAlign: 'center', margin: '15px 0' }}>
					<CircularProgress />
				</div>
			)}
			{error && (
				<Alert severity='error' sx={{ mb: 2 }}>
					{error.message}
				</Alert>
			)}

			<BoxWrapper>
				<BoxRow>
					<div style={{ width: '40%' }}>
						<Trans>Market</Trans>
					</div>
					<div style={{ width: '60%' }}>
						<TextField
							{...register('market', {
								required: t`This field is required.`,
							})}
							style={{ width: '100%' }}
							size='small'
							error={!!errors.market}
						/>
						<FormError>
							<ErrorMessage errors={errors} name={`market`} />
						</FormError>
					</div>
				</BoxRow>
				<BoxRow>
					<div style={{ width: '40%' }}>
						<Trans>Bid</Trans> ({getConfigString('NETWORK_TOKEN', chain.id)})
					</div>
					<div style={{ width: '60%' }}>
						<TextField
							{...register('bid', {
								required: t`This field is required.`,
								validate: {
									isNumber: (v) => !isNaN(Number(v)) || t`Invalid number.`,
									isGreaterThan0: (v) =>
										(!isNaN(Number(v)) && (isEdit ? Number(v) >= 0 : Number(v) > 0)) || t`Value must be greater than 0`,
								},
							})}
							style={{ width: '100%' }}
							size='small'
							error={!!errors.bid}
						/>
						{isEdit && (
							<FormHelperText>
								<Trans>The provided value will be added to the current bid.</Trans>
							</FormHelperText>
						)}
						<FormError>
							<ErrorMessage errors={errors} name={`bid`} />
						</FormError>
					</div>
				</BoxRow>
				<BoxRow>
					<div style={{ width: '40%' }}>
						<Trans>Bid per second</Trans> ({getConfigString('NETWORK_TOKEN', chain.id)})
					</div>
					<div style={{ width: '60%' }}>
						<TextField
							{...register('bidPerSecond', {
								required: t`This field is required.`,
								validate: {
									number: (v) => !isNaN(Number(v)) || t`Invalid number.`,
									bid: (v) => validBid(v) || t`Offer too low`,
									isGreaterThan0: (v) => (!isNaN(Number(v)) && Number(v) > 0) || t`Value must be greater than 0`,
								},
							})}
							style={{ width: '100%' }}
							size='small'
							error={!!errors.bidPerSecond}
						/>
						<FormError>
							<ErrorMessage errors={errors} name={`bidPerSecond`} />
						</FormError>
					</div>
				</BoxRow>
			</BoxWrapper>
		</form>
	)
}
