import { ErrorMessage } from '@hookform/error-message'
import { t } from '@lingui/macro'
import { Trans } from '@lingui/macro'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import { Address } from '@wagmi/core'
import React from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useAccount, useNetwork, UsePrepareContractWriteConfig } from 'wagmi'

import { KeyValueAbi } from '@/abi/KeyValue'
import { FormError } from '@/components'
import { usePlayer } from '@/hooks/usePlayer'
import { useSendTx } from '@/hooks/useSendTx'
import { filterChainId, getConfigAddress } from '@/lib/config'

export type ProfileFormValues = {
	name: string
}

const wrapperStyles: React.CSSProperties = {
	textAlign: 'center',
	borderTop: '1px solid #969696',
	borderBottom: '1px solid #969696',
	marginBottom: '30px',
}
const innerStyles: React.CSSProperties = {
	maxWidth: '640px',
	margin: '0 auto',
	padding: '15px',
}

function getTxParams(
	chainId: number,
	userId: Address | undefined,
	name: string
): UsePrepareContractWriteConfig<typeof KeyValueAbi, 'setUsername'> {
	if (!userId || !name) {
		return {}
	}

	return {
		address: getConfigAddress('KEY_VALUE', chainId),
		abi: KeyValueAbi,
		functionName: 'setUsername',
		args: [userId, name],
	}
}

export default function ProfileForm({ defaultName }: { defaultName: string }) {
	const { address } = useAccount()
	const { chain } = useNetwork()
	const chainId = filterChainId(chain?.id)
	const { data: player } = usePlayer((address || '') as Address)

	const {
		register,
		formState: { errors },
		handleSubmit,
		control,
	} = useForm<ProfileFormValues>({
		defaultValues: {
			name: defaultName,
		},
	})

	const name = useWatch({ control, name: 'name' })

	const { isPrepareError, isLoading, isSuccess, error, write } = useSendTx(getTxParams(chainId, address, name))

	if (!address) {
		return null
	}

	if (isSuccess) {
		return (
			<div style={wrapperStyles}>
				<div style={innerStyles}>
					<Alert severity='success'>
						<Trans>Username updated</Trans>!
					</Alert>
				</div>
			</div>
		)
	}

	const onSubmit = async (/*data: ProfileFormValues*/) => {
		write!()
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} style={wrapperStyles}>
			{isLoading && (
				<div style={{ textAlign: 'center', margin: '15px 0' }}>
					<CircularProgress />
				</div>
			)}

			{!isLoading && (
				<div style={innerStyles}>
					{error && (
						<Alert severity='error' sx={{ mb: 2 }}>
							{error.message}
						</Alert>
					)}

					{isPrepareError && name !== player?.name && (
						<Alert severity='error' sx={{ mb: 2 }}>
							<Trans>Name already in use, please select another name</Trans>
						</Alert>
					)}

					<div
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							margin: '0 auto',
						}}
					>
						<div style={{ width: '410px', marginRight: '20px' }}>
							<FormControl fullWidth>
								<TextField
									{...register('name', {
										required: t`This field is required.`,
									})}
									placeholder={t`Your username`}
									error={!!errors.name}
									style={{ width: '100%' }}
								/>
								<FormError>
									<ErrorMessage errors={errors} name={`name`} />
								</FormError>
							</FormControl>
						</div>
						<div>
							<Button color='primary' type='submit' disabled={!write}>
								<Trans>Change username</Trans>
							</Button>
						</div>
					</div>
				</div>
			)}
		</form>
	)
}
