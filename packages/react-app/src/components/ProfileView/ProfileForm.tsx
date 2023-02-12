import { ErrorMessage } from '@hookform/error-message'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import { FormControl } from '@mui/material'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import { Address } from '@wagmi/core'
import React from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useAccount, useNetwork, UsePrepareContractWriteConfig } from 'wagmi'

import { KeyValueAbi } from '@/abi/KeyValue'
import { FormError } from '@/components'
import { usePlayer } from '@/hooks/usePlayer'
import { useSendTx } from '@/hooks/useSendTx'

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
	userId: Address | undefined,
	name: string
): UsePrepareContractWriteConfig<typeof KeyValueAbi, 'setUsername'> {
	if (!userId || !name) {
		return {}
	}

	return {
		address: import.meta.env.VITE_KEY_VALUE as Address,
		abi: KeyValueAbi,
		functionName: 'setUsername',
		args: [userId, name],
	}
}

export default function ProfileForm({ defaultName }: { defaultName: string }) {
	const { address } = useAccount()
	const { chain } = useNetwork()
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

	const { isPrepareError, isLoading, isSuccess, error, write } = useSendTx(getTxParams(address, name))

	if (!address) {
		return null
	}

	if (!chain || chain.unsupported) {
		return (
			<div style={wrapperStyles}>
				<div style={innerStyles}>
					<Alert severity='error'>
						<Trans id='UNSUPPORTED_CHAIN' />
					</Alert>
				</div>
			</div>
		)
	}

	if (isSuccess) {
		return (
			<div style={wrapperStyles}>
				<div style={innerStyles}>
					<Alert severity='success'>
						<Trans id='Username updated' />!
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
							<Trans id='Name already in use, please select another name' />
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
										required: i18n._('This field is required.'),
									})}
									placeholder={i18n._('Your username')}
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
								<Trans id='Change username' />
							</Button>
						</div>
					</div>
				</div>
			)}
		</form>
	)
}
