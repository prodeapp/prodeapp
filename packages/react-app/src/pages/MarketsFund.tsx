import { parseUnits } from '@ethersproject/units'
import { ErrorMessage } from '@hookform/error-message'
import { t } from '@lingui/macro'
import { Trans } from '@lingui/macro'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { Address } from '@wagmi/core'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { useAccount, useNetwork } from 'wagmi'

import { MarketAbi } from '@/abi/Market'
import { BoxLabelCell, BoxRow, BoxWrapper, FormError } from '@/components'
import { useSendRecklessTx } from '@/hooks/useSendTx'
import { getConfigString, isMainChain } from '@/lib/config'

export type FundMarketFormData = {
	value: string
	message: string
}

function MarketsFund() {
	const { id: marketId } = useParams()
	const { address } = useAccount()
	const { chain } = useNetwork()

	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<FundMarketFormData>({
		mode: 'all',
		defaultValues: {
			value: '0',
			message: '',
		},
	})

	const { isSuccess, error, write } = useSendRecklessTx({
		address: String(marketId) as Address,
		abi: MarketAbi,
		functionName: 'fundMarket',
	})

	const onSubmit = async (data: FundMarketFormData) => {
		write!({
			recklesslySetUnpreparedArgs: [data.message],
			recklesslySetUnpreparedOverrides: {
				value: parseUnits(String(data.value), 18),
			},
		})
	}

	if (!address) {
		return (
			<Alert severity='error'>
				<Trans>Connect your wallet to fund a market.</Trans>
			</Alert>
		)
	}

	if (!chain || chain.unsupported) {
		return (
			<Alert severity='error'>
				<Trans>UNSUPPORTED_CHAIN</Trans>
			</Alert>
		)
	}

	if (!isMainChain(chain?.id)) {
		return (
			<Alert severity='error'>
				<Trans>ONLY_MAIN_CHAIN</Trans>
			</Alert>
		)
	}

	return (
		<>
			{error && (
				<Alert severity='error' sx={{ mb: 2 }}>
					{error.message}
				</Alert>
			)}
			{isSuccess && (
				<Alert severity='success' sx={{ mb: 2 }}>
					<Trans>Market funded successfully!</Trans>
				</Alert>
			)}

			<form onSubmit={handleSubmit(onSubmit)}>
				<BoxWrapper>
					<BoxRow>
						<BoxLabelCell>
							<Trans>Fund amount ({getConfigString('NETWORK_TOKEN', chain.id)})</Trans>
						</BoxLabelCell>
						<div style={{ width: '100%' }}>
							<TextField
								{...register('value', {
									required: t`This field is required.`,
									valueAsNumber: true,
									validate: (v) => !isNaN(Number(v)) || t`Invalid number.`,
									min: {
										value: 0.01,
										message: t`Fund amount must be greater than 0.01`,
									},
								})}
								style={{ width: '100%' }}
							/>
							<FormError>
								<ErrorMessage errors={errors} name='value' />
							</FormError>
						</div>
					</BoxRow>
					<BoxRow>
						<BoxLabelCell>
							<Trans>Message</Trans>
						</BoxLabelCell>
						<div style={{ width: '100%' }}>
							<TextField
								{...register('message', {
									required: false,
								})}
								style={{ width: '100%' }}
							/>
							<FormError>
								<ErrorMessage errors={errors} name='message' />
							</FormError>
						</div>
					</BoxRow>
				</BoxWrapper>

				{isValid && (
					<div style={{ textAlign: 'center', width: '100%', marginBottom: '20px' }}>
						<div>
							<Button type='submit'>
								<Trans>Submit</Trans>
							</Button>
						</div>
					</div>
				)}
			</form>
		</>
	)
}

export default MarketsFund
