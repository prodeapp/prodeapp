import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import React, { useEffect, useState } from 'react'
import { useAccount, useBalance, useNetwork } from 'wagmi'

import AppDialog from '@/components/Dialog'
import { DEFAULT_CHAIN, NetworkId } from '@/lib/config'
import { BRIDGE_URL } from '@/lib/helpers'

function WelcomeDialog() {
	const { chain = { id: DEFAULT_CHAIN } } = useNetwork()
	const { address } = useAccount()
	const { data: balance } = useBalance({ address })

	const [alreadyOpened, setAlreadyOpened] = useState(false)
	const [open, setOpen] = useState(false)

	useEffect(() => {
		setOpen(balance?.value === undefined ? false : balance.value.eq(0))
	}, [balance])

	const handleClose = () => {
		setAlreadyOpened(true)
		setOpen(false)
	}

	if (chain.id !== NetworkId.GNOSIS) {
		return null
	}

	return (
		<AppDialog open={!alreadyOpened && open} handleClose={handleClose} title={i18n._('Hey! Welcome to Prode')}>
			<div style={{ marginBottom: 15 }}>
				<Trans id='It looks like you have 0 xDAI in your wallet.' />
			</div>
			<div style={{ marginBottom: 15 }}>
				<Trans id='xDAI is the native token of Gnosis Chain, and the one used to place bets in the markets.' />
			</div>
			<div style={{ marginBottom: 15 }}>
				<Trans id='xDAI is bridged DAI, so if you have DAI in any other network (Ethereum Mainnet, Arbitrum, Optimism, etc.), you can use the bridge to transfer some of it to Gnosis Chain.' />
			</div>
			<div style={{ marginBottom: 15 }}>
				<Trans id='If first you want to take a look around, you can access the bridge later from the link in the main menu.' />
			</div>
			<div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
				<Button color='primary' size='large' component={Link} href={BRIDGE_URL} target='_blank' rel='noopener'>
					<Trans id='Go to the bridge' />
				</Button>
				<Button color='primary' size='large' variant='outlined' onClick={handleClose}>
					<Trans id='Close and bridge later' />
				</Button>
			</div>
		</AppDialog>
	)
}

export default WelcomeDialog
