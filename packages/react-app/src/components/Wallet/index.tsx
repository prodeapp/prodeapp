import { Trans } from '@lingui/macro'
import CloseIcon from '@mui/icons-material/Close'
import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Typography from '@mui/material/Typography'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Link as RouterLink } from 'react-router-dom'
import { useAccount, useDisconnect, useNetwork } from 'wagmi'

import { ConnectButton, InPageConnectButton } from '@/components/ConnectButton'
import { TabActiveBets, TabWinningBets } from '@/components/Wallet/TabBets'
import TabInfo from '@/components/Wallet/TabInfo'

import { TabAllAnswers } from './TabAnswers'

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
	const theme = useTheme()

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

	const { isConnected, address } = useAccount()
	const { chain } = useNetwork()

	// only enable backdrop transition on ios devices,
	// because we can assume IOS is hosted on hight-end devices and will not drop frames
	// also disable discovery on IOS, because of it's 'swipe to go back' feat
	const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

	const DisconnectButton = () => {
		const { disconnect } = useDisconnect()
		return (
			<Button color='primary' size='small' variant='outlined' onClick={() => disconnect()}>
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

	const TabButton = (props: { isActiveComponent: boolean; to: string; children: React.ReactNode }) => {
		if (props.isActiveComponent) {
			return (
				<Button component={RouterLink} color='primary' size='small' to={props.to} sx={{ borderRadius: 1, mr: 1 }}>
					{props.children}
				</Button>
			)
		}

		return (
			<Button
				component={RouterLink}
				color='primary'
				variant='outlined'
				size='small'
				to={props.to}
				sx={{ borderRadius: 1, background: 'transparent', mr: 1 }}
			>
				{props.children}
			</Button>
		)
	}

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

					<Box sx={{ background: theme.palette.secondary.main, padding: 1, mb: 2 }}>
						<TabButton isActiveComponent={props.component === 'wallet'} to='/wallet'>
							Wallet
						</TabButton>
						<TabButton isActiveComponent={props.component === 'active-bets'} to='/active-bets'>
							Active Bets
						</TabButton>
						<TabButton isActiveComponent={props.component === 'winning-bets'} to='/winning-bets'>
							Winning Bets
						</TabButton>
						<TabButton isActiveComponent={props.component === 'answers-events'} to='/answers-events'>
							Answers Events
						</TabButton>
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
							case 'active-bets':
								return <>{address && chain && <TabActiveBets playerId={address} chainId={chain.id} />}</>
							case 'answers-events':
								return <>{address && chain && <TabAllAnswers playerId={address} chainId={chain.id} />}</>
							default:
								return <>{address && chain && <TabWinningBets playerId={address} chainId={chain.id} />}</>
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
