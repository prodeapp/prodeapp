import { BigNumber } from '@ethersproject/bignumber'
import { parseEther } from '@ethersproject/units'
import { Trans } from '@lingui/react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import TextField from '@mui/material/TextField'
import { getContract, getProvider } from '@wagmi/core'
import React, { useState } from 'react'
import { useNetwork } from 'wagmi'

import { Bytes } from '@/abi/types'
import { FormLabel, FormRow } from '@/components'
import { useSendRecklessTx } from '@/hooks/useSendTx'
import { filterChainId, getConfigAddress, getConfigString } from '@/lib/config'

interface VoucherData {
	address: string
	value: string
}

const TRANSACTION_BATCHER = '0xA73A872eFD768bb23efb24CEeB9e330bcCA259D6'

const BATCHER_ABI = [
	{
		constant: false,
		inputs: [
			{ name: 'targets', type: 'address[]' },
			{ name: 'values', type: 'uint256[]' },
			{ name: 'datas', type: 'bytes[]' },
		],
		name: 'batchSend',
		outputs: [],
		payable: true,
		stateMutability: 'payable',
		type: 'function',
	},
] as const

const VOUCHER_MANAGER_ABI = [
	{
		type: 'function',
		stateMutability: 'payable',
		outputs: [],
		name: 'fundAddress',
		inputs: [{ type: 'address', name: '_to', internalType: 'address' }],
	},
]

function SendVouchers() {
	const { chain } = useNetwork()
	const { isLoading, isSuccess, write } = useSendRecklessTx({
		address: TRANSACTION_BATCHER,
		abi: BATCHER_ABI,
		functionName: 'batchSend',
	})

	const voucherContract = getContract({
		address: getConfigAddress('VOUCHER_MANAGER', chain?.id),
		abi: VOUCHER_MANAGER_ABI,
		signerOrProvider: getProvider({ chainId: filterChainId(chain?.id) }),
	})

	const [vouchers, setVouchers] = useState<VoucherData[]>([])

	const regex = /(0x[a-fA-F0-9]{40})[ ,=](\d.?\d*)/g

	const onChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
		setVouchers(
			[...evt.target.value.matchAll(regex)].map(match => ({
				address: match[1],
				value: match[2],
			}))
		)
	}

	const sendVouchers = async () => {
		const values: BigNumber[] = vouchers.map(voucher => parseEther(voucher.value))

		write!({
			recklesslySetUnpreparedArgs: [
				Array(vouchers.length).fill(getConfigAddress('VOUCHER_MANAGER', chain?.id)),
				values,
				await Promise.all(
					vouchers.map(
						async voucher => (await voucherContract.populateTransaction.fundAddress(voucher.address)).data! as Bytes
					)
				),
			],
			recklesslySetUnpreparedOverrides: {
				value: values.reduce((partialSum, a) => partialSum.add(a), BigNumber.from(0)),
			},
		})
	}

	return (
		<Container sx={{ mt: 10 }}>
			{isLoading && (
				<div style={{ textAlign: 'center', margin: '15px 0' }}>
					<CircularProgress />
				</div>
			)}

			{isSuccess && (
				<Alert severity='success'>
					<Trans id='Vouchers sent' />
				</Alert>
			)}

			{!isSuccess && !isLoading && (
				<div style={{ maxWidth: '700px', margin: '0 auto' }}>
					<FormRow>
						<FormLabel>
							Enter one address and amount in {getConfigString('NETWORK_TOKEN', chain?.id)} on each line.
						</FormLabel>
						<div style={{ width: '100%' }}>
							<TextField
								onChange={onChange}
								multiline
								rows={10}
								style={{ width: '100%' }}
								placeholder={`0x314ab97b76e39d63c78d5c86c2daf8eaa306b182 3.141592
0x271bffabd0f79b8bd4d7a1c245b7ec5b576ea98a,2.7182
0x141ca95b6177615fb1417cf70e930e102bf8f584=1.41421`}
							/>
						</div>
					</FormRow>
					{vouchers.length > 0 && (
						<>
							<FormLabel>Confirm voucher info:</FormLabel>
							<div>
								{vouchers.map((voucher, i) => {
									return (
										<div style={{ display: 'flex' }} key={i}>
											<div>{voucher.address}</div>
											<div
												style={{
													margin: 'auto 0.3em',
													borderBottom: '1px #111111 solid',
													flexGrow: 1,
												}}
											></div>
											<div>
												{voucher.value} {getConfigString('NETWORK_TOKEN', chain?.id)}
											</div>
										</div>
									)
								})}
							</div>
							<FormRow>
								<div
									style={{
										textAlign: 'center',
										width: '100%',
										marginTop: '20px',
									}}
								>
									<Button type='button' onClick={sendVouchers}>
										<Trans id='Submit' />
									</Button>
								</div>
							</FormRow>
						</>
					)}
				</div>
			)}
		</Container>
	)
}

export default SendVouchers
