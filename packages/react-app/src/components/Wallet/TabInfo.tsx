import { BigNumber } from '@ethersproject/bignumber'
import { Trans } from '@lingui/macro'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Modal from '@mui/material/Modal'
import { GridCloseIcon } from '@mui/x-data-grid'
import { useAccountModal } from '@rainbow-me/rainbowkit'
import { sequence } from '0xsequence'
import { OpenWalletIntent, Settings } from '0xsequence/dist/declarations/src/provider'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useAccount, useBalance, useNetwork, useSignMessage } from 'wagmi'

import { RealityAbi } from '@/abi/RealityETH_v3_0'
import { useClaimArgs } from '@/hooks/useReality'
import { useSendRecklessTx } from '@/hooks/useSendTx'
import { getConfigAddress, isMainChain } from '@/lib/config'
import { CROSS_CHAIN_CONFIG } from '@/lib/connext'
import { formatAmount } from '@/lib/helpers'
import { useI18nContext } from '@/lib/I18nContext'

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
	const { locale } = useI18nContext()
	const [addressSigner, setAddressSigner] = useState<string>(() => {
		// getting stored value
		const localAddress = localStorage.getItem('mtPelerinAddress')
		return localAddress ? JSON.parse(localAddress) : ''
	})
	const [signature, setSignature] = useState<string | undefined>(() => {
		// getting stored value
		const hash = localStorage.getItem('mtPelerinHash')
		return hash ? JSON.parse(hash) : undefined
	})
	const [signingStarted, setSigningStarted] = useState<boolean>(false)
	console.log(signature, addressSigner)
	useEffect(() => {
		if (address !== addressSigner) {
			// clean storage
			setSignature('')
			setAddressSigner('')
		}
	}, [signature, addressSigner, address])

	useEffect(() => {
		// update storage
		if (signature) {
			localStorage.setItem('mtPelerinHash', JSON.stringify(signature))
		}
		if (addressSigner) {
			localStorage.setItem('mtPelerinAddress', JSON.stringify(addressSigner))
		}
	}, [signature, addressSigner])

	useEffect(() => {
		if (signingStarted && data && (!isSuccess || addressSigner !== address || signature === undefined)) {
			setAddressSigner(address)
			const hash = ethers.utils.base64.encode(data!)
			setSignature(hash)
		} else if (error) {
			handleClose()
		}
	}, [isSuccess, addressSigner, address, data, signingStarted])

	const handleOpen = () => {
		if (addressSigner !== address || signature === undefined) {
			// no signature in the local storage
			const number = (Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000).toString()
			const message = `MtPelerin-${number}`
			signMessage({ message })
			setSigningStarted(true)
		}
		setOpen(true)
	}
	const handleClose = () => {
		setOpen(false)
	}

	const style = {
		position: 'absolute',
		top: { xs: '0', md: '50%' },
		left: { xs: '0', md: '50%' },
		transform: { xs: null, md: 'translate(-50%, -50%)' },
		width: { xs: '100%', md: '50%' },
		minHeight: '80%',
		margin: 'auto',
		height: { xs: '100%', md: '5rem' },
		boxShadow: 24,
		backgroundColor: 'background.paper',
		display: 'flex',
		flexDirection: 'column',
	}

	return (
		<>
			<Button onClick={handleOpen} sx={{ width: '100%' }}>
				{uniqueMethod ? <Trans>Fund with Card</Trans> : <Trans>Fund with MtPelegrin</Trans>}
			</Button>
			<Modal
				open={open}
				onClose={handleClose}
				aria-labelledby='child-modal-title'
				aria-describedby='child-modal-description'
			>
				<Box sx={style}>
					<div style={{ height: '2%' }}>
						<IconButton onClick={handleClose}>
							<GridCloseIcon />
						</IconButton>
					</div>
					{signature ? (
						<div style={{ width: '100%', height: '100%' }}>
							<iframe
								src={`https://widget.mtpelerin.com/?lang=${locale}&tab=buy&type=web&primary=%234267B3&ssc=XDAI&sdc=EUR&net=xdai_mainnet&crys=XDAI&chain=xdai_mainnet&bsc=EUR&bdc=XDAI&mylogo=https%3A%2F%2Fprode.market%2Flogo512.png&addr=${address}&hash=${signature}`}
								width={'100%'}
								height={'100%'}
								frameBorder={0}
							></iframe>
						</div>
					) : (
						<Trans>Please sign the message</Trans>
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
	const { openAccountModal } = useAccountModal()

	const openSequenceTopUp = () => {
		const settings: Settings = {
			theme: 'light',
			bannerUrl: 'https://prode.market/banners/banner-1.png', // 3:1 aspect ratio, 1200x400 works best
			defaultFundingCurrency: 'usdc',
			lockFundingCurrencyToDefault: false,
		}

		const intent: OpenWalletIntent = {
			type: 'openWithOptions',
			options: {
				settings: settings,
			},
		}
		const path = 'wallet/add-funds'
		sequenceWallet.openWallet(path, intent)
	}
	return (
		<>
			<Button onClick={handleOpen}>
				<Trans>TopUp</Trans>
			</Button>
			<Dialog
				open={open}
				onClose={handleClose}
				aria-labelledby='modal-modal-title'
				aria-describedby='modal-modal-description'
				PaperProps={{
					style: {
						backgroundColor: 'background.paper',
						boxShadow: 'none',
						width: '50%',
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						minHeight: '10rem',
						margin: '0',
						display: 'flex',
					},
				}}
			>
				<DialogTitle>
					<IconButton onClick={handleClose}>
						<Trans>Fund methods available by third parties</Trans>
						<GridCloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent>
					{/* TODO: fix styles */}
					<Grid
						container
						spacing={2}
						style={{
							display: 'flex',
							backgroundColor: 'background.paper',
							alignItems: 'stretch',
							alignContent: 'center',
							justifyContent: 'center',
							justifyItems: 'stretch',
							minHeight: '10rem',
						}}
					>
						<Grid
							item
							sm={6}
							style={{
								justifyContent: 'center',
								justifyItems: 'space-around',
								alignItems: 'stretch',
								alignContent: 'center',
								padding: '5px 10px',
							}}
						>
							{isSequenceWallet ? (
								<Grid item sm={12}>
									<Button onClick={openSequenceTopUp} style={{ width: '100%' }}>
										<Trans>Fund with Sequence Methods</Trans>
									</Button>
								</Grid>
							) : null}
							<Grid item sm={12}>
								<MtPelerin address={address} uniqueMethod={!isSequenceWallet} />
							</Grid>
						</Grid>
						<Grid
							item
							sm={6}
							style={{
								padding: '5px 10px',
								justifyItems: 'space-around',
								justifyContent: 'center',
								alignContent: 'center',
								alignItems: 'stretch',
							}}
						>
							<Button style={{ width: '100%' }} onClick={openAccountModal}>
								<Trans>Already have crypto</Trans>
							</Button>
						</Grid>
					</Grid>
				</DialogContent>
			</Dialog>
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
