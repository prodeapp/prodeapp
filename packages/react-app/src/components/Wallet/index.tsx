import { Trans } from '@lingui/macro'
import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAccount, useDisconnect } from 'wagmi'

import { ConnectButton, InPageConnectButton } from '@/components/ConnectButton'
import TabInfo from '@/components/Wallet/TabInfo'

const PREFIX = 'Wallet'

const classes = {
	root: `${PREFIX}-root`,
	paper: `${PREFIX}-paper`,
	networkSelector: `${PREFIX}-networkSelector`,
	connectButton: `${PREFIX}-connectButton`,
}

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const StyledSwipeableDrawer = styled(SwipeableDrawer)(({ theme }) => ({
	[`& .${classes.networkSelector}`]: {
		background: theme.palette.secondary.light,
		minHeight: '39px',
		borderRadius: '6px',
		padding: '9px 18px',
		alignItems: 'center',
	},

	[`& .${classes.connectButton}`]: {
		background: theme.palette.secondary.light,
		'&:hover': {
			background: theme.palette.secondary.light,
		},
	},

	[`&.${classes.root}`]: {
		width: '460px',
		maxWidth: '100%',
	},

	[`& .${classes.paper}`]: {
		maxWidth: '100%',
		width: 'inherit',
		background: theme.palette.secondary.light,
	},
}))

export function Wallet(props: { open?: boolean; component?: string }) {
	interface LocationState {
		state: { prevPath: string }
	}
	const { state: closeRedirect } = useLocation() as LocationState
	const [closeLocation, setCloseLocation] = useState('/')

	//Watch for PrevPath passed in and set it as path to close.
	useEffect(() => {
		if (closeRedirect && closeRedirect.prevPath) {
			setCloseLocation(closeRedirect.prevPath)
		}
	}, [closeRedirect])

	const navigate = useNavigate()

	const { isConnected } = useAccount()

	// only enable backdrop transition on ios devices,
	// because we can assume IOS is hosted on hight-end devices and will not drop frames
	// also disable discovery on IOS, because of it's 'swipe to go back' feat
	const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

	const DisconnectButton = () => {
		const { disconnect } = useDisconnect()
		return (
			<Button color='primary' variant='outlined' onClick={() => disconnect()}>
				<Trans>Disconnect</Trans>
			</Button>
		)
	}

	const ConnectMessage = () => (
		<>
			<Box display='flex' justifyContent='center' mt={'61px'}>
				<Typography fontWeight={600}> Please Connect Your Wallet </Typography>
			</Box>
			<Box mt={'75px'}>
				<InPageConnectButton size='large' fullWidth />
			</Box>
		</>
	)

	return (
		<StyledSwipeableDrawer
			disableBackdropTransition={!isIOS}
			disableDiscovery={isIOS}
			anchor='right'
			open={props.open ? true : false}
			onOpen={() => null}
			onClose={() => navigate(closeLocation)}
			classes={{
				root: classes.root,
				paper: classes.paper,
			}}
		>
			<Box p='30px 15px' style={{ overflow: 'hidden' }}>
				<Box style={{ top: 0, position: 'sticky' }}>
					<Box display='flex' justifyContent='space-between' mb={'18px'}>
						<Box display='flex' flexDirection='row'>
							<ConnectButton />
							{/*<ThemeSwitcher theme={props.theme} toggleTheme={props.toggleTheme} />*/}
						</Box>
						<Box display='flex' flexDirection='row' justifyContent='flex-end' alignItems='center' textAlign='right'>
							<CloseIcon
								onClick={() => {
									navigate(closeLocation)
								}}
								style={{ cursor: 'pointer' }}
							/>
						</Box>
					</Box>
				</Box>
				<Box
					style={{
						height: '100vh',
						display: 'block',
						overflowY: 'scroll',
						overflowX: 'hidden',
						paddingBottom: 'calc(85%)',
					}}
				>
					{(() => {
						switch (props.component) {
							case 'wallet':
								return <>{!isConnected ? <ConnectMessage /> : <TabInfo />}</>
							default:
								;<></>
						}
					})()}
				</Box>
			</Box>
			{(props.component !== 'wallet' || isConnected) && (
				<Box
					display='flex'
					flexDirection='row'
					justifyContent='center'
					style={{ position: 'sticky', bottom: 0, boxShadow: '0px -3px 3px rgba(0, 0, 0, 0.1)' }}
					pt={'21px'}
					pb={'21px'}
				>
					{isConnected ? <DisconnectButton /> : <InPageConnectButton />}
				</Box>
			)}
		</StyledSwipeableDrawer>
	)
}

export default Wallet