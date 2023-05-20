import { Trans } from '@lingui/macro'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit'
import { Link as RouterLink } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

export const InPageConnectButton = ({
	fullWidth = false,
	size = 'large',
}: {
	fullWidth?: boolean
	size?: 'small' | 'medium' | 'large'
}) => {
	return (
		<RainbowConnectButton.Custom>
			{({ account, chain, openConnectModal, mounted }) => {
				return (
					<div
						{...(!mounted && {
							'aria-hidden': true,
							style: {
								opacity: 0,
								pointerEvents: 'none',
								userSelect: 'none',
							},
						})}
					>
						{(() => {
							if (!mounted || !account || !chain) {
								return (
									<Button color='primary' size={size} fullWidth={fullWidth} onClick={openConnectModal}>
										<AccountBalanceWalletOutlinedIcon sx={{ mr: '9px' }} />
										<Trans>Connect</Trans>
									</Button>
								)
							}
						})()}
					</div>
				)
			}}
		</RainbowConnectButton.Custom>
	)
}
export const ConnectButton = (props: { buttonColor?: 'primary' | 'secondary' }) => {
	const location = useLocation()
	const theme = useTheme()
	const mobile = useMediaQuery(theme.breakpoints.down('sm'))

	const walletDrawerOpen =
		location.pathname === '/wallet' ||
		location.pathname === '/active-bets' ||
		location.pathname === '/winning-bets' ||
		location.pathname === '/events-answers'
			? true
			: false

	return (
		<RainbowConnectButton.Custom>
			{({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
				return (
					<div
						{...(!mounted && {
							'aria-hidden': true,
							style: {
								opacity: 0,
								pointerEvents: 'none',
								userSelect: 'none',
							},
						})}
					>
						{(() => {
							if (!mounted || !account || !chain) {
								if (walletDrawerOpen) {
									return (
										<Button color='secondary' onClick={openConnectModal}>
											<AccountBalanceWalletOutlinedIcon sx={{ mr: '9px' }} />
											<Trans>{`Connect`}</Trans>
										</Button>
									)
								} else {
									return (
										<Button
											onClick={openConnectModal}
											style={{ marginRight: '0px', zIndex: 18 }}
											color={props.buttonColor || 'primary'}
										>
											<AccountBalanceWalletOutlinedIcon sx={{ mr: mobile ? 0 : '9px' }} />
											{!mobile && <Trans>Connect</Trans>}
										</Button>
									)
								}
							}
							return (
								<Box display='flex' alignItems='center'>
									{walletDrawerOpen ? (
										<>
											<Button
												color='secondary'
												sx={{ mr: 1 }}
												onClick={chain.unsupported ? openChainModal : openAccountModal}
											>
												<AccountBalanceWalletOutlinedIcon sx={{ mr: '9px' }} />
												{!mobile && <>{chain.unsupported ? <Trans>Unsupported Network</Trans> : account.displayName}</>}
											</Button>
											<Button color='secondary' sx={{ mr: 1 }} onClick={openChainModal}>
												{chain.unsupported && <ErrorOutlineIcon style={{ fill: theme.palette.error.main }} />}
												{chain.hasIcon && (
													<div
														style={{
															background: chain.iconBackground,
															width: 24,
															height: 24,
															borderRadius: 999,
															overflow: 'hidden',
														}}
													>
														{chain.iconUrl && (
															<img
																alt={chain.name ?? 'Chain icon'}
																src={chain.iconUrl}
																style={{ width: 24, height: 24 }}
															/>
														)}
													</div>
												)}
											</Button>
											<Button component={RouterLink} to={'/profile'} style={{ marginRight: '0px' }} color='secondary'>
												<Trans>See profile</Trans>
											</Button>
										</>
									) : (
										<Button
											component={RouterLink}
											to={'/wallet'}
											state={{ prevPath: location.pathname }}
											style={{ marginRight: '0px' }}
											color='primary'
										>
											<AccountBalanceWalletOutlinedIcon sx={{ mr: mobile ? 0 : '9px' }} />
											{!mobile && (chain.unsupported ? <Trans>Unsupported Network</Trans> : account.displayName)}
										</Button>
									)}
								</Box>
							)
						})()}
					</div>
				)
			}}
		</RainbowConnectButton.Custom>
	)
}
