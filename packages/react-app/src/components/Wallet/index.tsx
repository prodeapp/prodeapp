import { Trans } from '@lingui/macro'
import CloseIcon from '@mui/icons-material/Close'
import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import Typography from '@mui/material/Typography'
import { BigNumber } from 'ethers'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Link as RouterLink } from 'react-router-dom'
import { Address, Chain, useAccount, useBalance, useDisconnect, useNetwork } from 'wagmi'

import { RealityAbi } from '@/abi/RealityETH_v3_0'
import { ConnectButton, InPageConnectButton } from '@/components/ConnectButton'
import { TabActiveBets, TabWinningBets } from '@/components/Wallet/TabBets'
import { useClaimArgs } from '@/hooks/useReality'
import { useSendRecklessTx } from '@/hooks/useSendTx'
import { getConfigAddress, isMainChain } from '@/lib/config'
import { CROSS_CHAIN_CONFIG } from '@/lib/connext'
import { formatAmount } from '@/lib/helpers'

import { TabPendingAnswers } from './TabAnswers'

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

function RealityClaim({
	address,
	chain,
}: {
	address: Address
	chain: (Chain & { unsupported?: boolean | undefined }) | undefined
}) {
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
	const mainChain = isMainChain(chain?.id)

	const daiAddress = chain ? CROSS_CHAIN_CONFIG?.[chain.id]?.DAI : undefined
	const { data: nativeBalance = { value: BigNumber.from(0) } } = useBalance({ address })
	const { data: daiBalance = { value: BigNumber.from(0) } } = useBalance({
		address,
		token: daiAddress,
		chainId: chain?.id,
	})

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

					{chain && (
						<Box style={{ marginBottom: 20 }}>
							<div style={{ fontSize: 12 }}>Balance</div>
							<div style={{ fontSize: 30, fontWeight: 600 }}>
								{formatAmount(mainChain ? nativeBalance.value : daiBalance.value, chain.id)}
							</div>
							<RealityClaim address={address!} chain={chain} />
						</Box>
					)}

					{isConnected ? (
						<Box sx={{ background: theme.palette.secondary.main, padding: 1, mb: 2 }}>
							<TabButton isActiveComponent={props.component === 'winning-bets'} to='/winning-bets'>
								Winning Bets
							</TabButton>
							<TabButton isActiveComponent={props.component === 'active-bets'} to='/active-bets'>
								Active Bets
							</TabButton>
							<TabButton isActiveComponent={props.component === 'events-answers'} to='/events-answers'>
								Events Answers
							</TabButton>
						</Box>
					) : (
						<ConnectMessage />
					)}
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
							case 'active-bets':
								return <>{address && chain && <TabActiveBets playerId={address} chainId={chain.id} />}</>
							case 'events-answers':
								return <>{address && chain && <TabPendingAnswers playerId={address} chainId={chain.id} />}</>
							default:
								return <>{address && chain && <TabWinningBets playerId={address} chainId={chain.id} />}</>
						}
					})()}
				</Box>
			</Box>
			{isConnected && (
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
