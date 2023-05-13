import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/macro'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Modal from '@mui/material/Modal'
import { sequence } from '0xsequence'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useAccount, useBalance, useNetwork, useSignMessage } from 'wagmi'

import { RealityAbi } from '@/abi/RealityETH_v3_0'
import { useClaimArgs } from '@/hooks/useReality'
import { useSendRecklessTx } from '@/hooks/useSendTx'
import { getConfigAddress, isMainChain } from '@/lib/config'
import { CROSS_CHAIN_CONFIG } from '@/lib/connext'
import { formatAmount } from '@/lib/helpers'

function RealityClaim() {
	const { chain } = useNetwork()
	const { address } = useAccount()

	const { data: claimArgs } = useClaimArgs(address || '')

	const { isSuccess, write } = useSendRecklessTx({
		address: getConfigAddress('REALITIO', chain?.id),
		abi: RealityAbi,
		functionName: 'claimMultipleAndWithdrawBalance',
	})

	const claimReality = async () => {
		if (!claimArgs) {
			return
		}

		write!({
			recklesslySetUnpreparedArgs: [
				claimArgs.question_ids,
				claimArgs.answer_lengths,
				claimArgs.history_hashes,
				claimArgs.answerers,
				claimArgs.bonds,
				claimArgs.answers,
			],
		})
	}

	if (chain && !chain.unsupported && isMainChain(chain?.id) && !isSuccess && claimArgs && claimArgs.total.gt(0)) {
		return (
			<div style={{ marginBottom: 20 }}>
				<div style={{ marginBottom: 10 }}>
					<Trans>You have funds available to claim for your answers.</Trans>
				</div>
				<Button onClick={claimReality} color='primary' size='small'>
					<Trans>Claim</Trans> {formatAmount(claimArgs.total, chain.id)}
				</Button>
			</div>
		)
	}

	return null
}

function MtPelerin({ address, uniqueMethod }: { address: string; uniqueMethod: boolean }) {
	const [open, setOpen] = useState<boolean>(false)
	const { data, error, signMessage, isSuccess } = useSignMessage()
	const [addressSigner, setAddressSigner] = useState<string>('')
	const [signature, setSignature] = useState<string | undefined>(undefined) // This hash should be in storage!

	useEffect(() => {
		if (data && (!isSuccess || addressSigner !== address || signature === undefined)) {
			setAddressSigner(address)
			const hash = ethers.utils.base64.encode(data!)
			setSignature(hash)
		} else if (error) {
			console.log(error)
		}
	}, [isSuccess, addressSigner, address, data])

	const handleOpen = () => {
		if (!isSuccess || addressSigner !== address || signature === undefined) {
			const number = (Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000).toString()
			const message = `MtPelerin-${number}`
			signMessage({ message })
		}
		setOpen(true)
	}
	const handleClose = () => {
		setOpen(false)
	}

	// TODO: Make style for mobile
	const style = {
		position: 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		width: '50%',
		minHeight: '80%',
		margin: 'auto',
		bgcolor: 'background.paper',
		height: '5rem',
		boxShadow: 24,
		p: 4,
		backgroundColor: 'paper.background',
	}

	return (
		<>
			<Button onClick={handleOpen}>{uniqueMethod ? 'Fund with Card' : 'Fund with MtPelegrin'}</Button>
			<Modal
				open={open}
				onClose={handleClose}
				aria-labelledby='child-modal-title'
				aria-describedby='child-modal-description'
			>
				<Box sx={style}>
					{isSuccess ? (
						<iframe
							src={`https://widget.mtpelerin.com/?lang=en&tab=buy&type=web&primary=%234267B3&ssc=XDAIC&sdc=EUR&net=xdai_mainnet&crys=XDAI&chain=xdai_mainnet&bsc=USD&bdc=XDAI&mylogo=https%3A%2F%2Fprode.market%2Flogo512.png&addr=${address}&hash=${signature}`}
							width={'100%'}
							height={'100%'}
							frameBorder={0}
						></iframe>
					) : (
						'Please sign the message'
					)}
				</Box>
			</Modal>
		</>
	)
}

function TopUp({ address }: { address: string }) {
	const [open, setOpen] = useState<boolean>(false)
	const handleOpen = () => setOpen(true)
	const handleClose = () => setOpen(false)
	const sequenceWallet = sequence.getWallet()
	const isSequenceWallet = sequenceWallet.isConnected()

	const openSequenceTopUp = () => {
		sequenceWallet.openWallet()
	}
	return (
		<>
			<Button onClick={handleOpen}>TopUp</Button>
			<Modal
				open={open}
				onClose={handleClose}
				aria-labelledby='modal-modal-title'
				aria-describedby='modal-modal-description'
			>
				{/* TODO: fix styles */}
				<div
					style={{
						display: 'flex',
						width: '50%',
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						minHeight: '50%',
						backgroundColor: 'pallete.secondary',
					}}
				>
					<div style={{ width: '50%' }}>
						{isSequenceWallet ? (
							<Button onClick={openSequenceTopUp} sx={{ display: 'flex', width: '50%' }}>
								Fund with Sequence Methods
							</Button>
						) : null}
						<div style={{ display: 'flex', width: isSequenceWallet ? '50%' : '100%' }}>
							<MtPelerin address={address} uniqueMethod={!isSequenceWallet} />
						</div>
					</div>
					<div style={{ width: '50%' }}>
						Already have crypto
						{/* TODO: Create popup with QR to send crypto */}
					</div>
				</div>
			</Modal>
		</>
	)
}

export default function TabInfo() {
	const { chain } = useNetwork()
	const { address } = useAccount()

	const daiAddress = chain ? CROSS_CHAIN_CONFIG?.[chain.id]?.DAI : undefined
	const { data: nativeBalance = { value: BigNumber.from(0) } } = useBalance({ address })
	const { data: daiBalance = { value: BigNumber.from(0) } } = useBalance({
		address,
		token: daiAddress,
		chainId: chain?.id,
	})

	const mainChain = isMainChain(chain?.id)

	return (
		<div>
			{chain && (
				<div style={{ marginBottom: 20, display: 'flex', alignItems: 'center' }}>
					<div style={{ flex: '2' }}>
						<div style={{ fontSize: 12 }}>Balance</div>
						{mainChain && (
							<div style={{ fontSize: 30, fontWeight: 600 }}>{formatAmount(nativeBalance.value, chain.id)}</div>
						)}
						{!mainChain && !!daiBalance && (
							<div style={{ fontSize: 30, fontWeight: 600 }}>{formatAmount(daiBalance.value, chain.id, true)}</div>
						)}
					</div>
					<div style={{ flex: '1' }}>
						<TopUp address={address!} />
					</div>
				</div>
			)}
			<RealityClaim />
		</div>
	)
}
