import { t, Trans } from '@lingui/macro'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Modal from '@mui/material/Modal'
import { GridCloseIcon } from '@mui/x-data-grid'
import { sequence } from '0xsequence'
import { OpenWalletIntent, Settings } from '0xsequence/dist/declarations/src/provider'
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { useSignMessage } from 'wagmi'

import AppDialog from '@/components/Dialog'
import { useI18nContext } from '@/lib/I18nContext'

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

export default function TopUp({ address }: { address: string }) {
	const [open, setOpen] = useState<boolean>(false)
	const handleOpen = () => setOpen(true)
	const handleClose = () => setOpen(false)
	const sequenceWallet = sequence.getWallet()
	const isSequenceWallet = sequenceWallet.isConnected()

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
			<Button onClick={handleOpen} size='small'>
				<Trans>Top Up</Trans>
			</Button>
			<AppDialog open={open} handleClose={handleClose} title={t`Fund methods available by third parties`}>
				<Grid container spacing={2}>
					<Grid item sm={6}>
						<MtPelerin address={address} uniqueMethod={!isSequenceWallet} />
					</Grid>
					{isSequenceWallet && (
						<Grid item sm={6}>
							<Button onClick={openSequenceTopUp} style={{ width: '100%' }}>
								<Trans>Fund with Sequence Methods</Trans>
							</Button>
						</Grid>
					)}
				</Grid>
			</AppDialog>
		</>
	)
}
