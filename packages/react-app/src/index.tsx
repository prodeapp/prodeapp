import './index.css'

import { ThemeProvider } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { WagmiConfig } from 'wagmi'

import Layout from './components/Layout'
import Wallet from './components/Wallet'
import { GlobalContextProvider } from './lib/GlobalContext'
import { I18nProvider } from './lib/I18nProvider'
import { ReactQueryProvider } from './lib/react-query'
import theme from './lib/theme'
import { chains, wagmiClient } from './lib/wagmi'
import AdsCreate from './pages/AdsCreate'
import AdsList from './pages/AdsList'
import AdsView from './pages/AdsView'
import CurateSubmit from './pages/CurateSubmit'
import CurateValidator from './pages/CurateValidator'
import Home from './pages/Home'
import Leaderboard from './pages/Leaderboard'
import MarketsCreate from './pages/MarketsCreate'
import MarketsFund from './pages/MarketsFund'
import MarketsView from './pages/MarketsView'
import Profile from './pages/Profile'
import SendVouchers from './pages/SendVouchers'
import TokenView from './pages/TokenView'
import Tournament from './pages/Tournament'

ReactDOM.render(
	<React.StrictMode>
		<WagmiConfig client={wagmiClient}>
			<RainbowKitProvider chains={chains}>
				<ReactQueryProvider>
					<ThemeProvider theme={theme}>
						<CssBaseline />
						<I18nProvider>
							<GlobalContextProvider>
								<HashRouter>
									<Routes>
										<Route element={<Layout />}>
											<Route index element={<Home />} />
											<Route path='markets'>
												<Route path=':chainId/:id'>
													<Route index element={<MarketsView />} />
													<Route path='tournament' element={<Tournament />} />
													<Route path='fund' element={<MarketsFund />} />
													<Route path=':tokenId' element={<TokenView />} />
												</Route>
												<Route path='new' element={<MarketsCreate />} />
											</Route>
											<Route path='leaderboard' element={<Leaderboard />} />
											<Route path='profile'>
												<Route index element={<Profile />} />
												<Route path=':id' element={<Profile />} />
											</Route>
											<Route path='curate/validator' element={<CurateValidator />} />
											<Route path='curate/submit/:marketId' element={<CurateSubmit />} />
											<Route path='send-vouchers' element={<SendVouchers />} />
											<Route path='ads'>
												<Route index element={<AdsList />} />
												<Route path='create' element={<AdsCreate />} />
												<Route path=':id' element={<AdsView />} />
											</Route>
										</Route>
										<Route path='/wallet' element={<Wallet open={true} component='wallet' />}></Route>
										<Route path='/active-bets' element={<Wallet open={true} component='active-bets' />}></Route>
										<Route path='/winning-bets' element={<Wallet open={true} component='winning-bets' />}></Route>
										<Route path='/events-answers' element={<Wallet open={true} component='events-answers' />}></Route>
									</Routes>
								</HashRouter>
							</GlobalContextProvider>
						</I18nProvider>
					</ThemeProvider>
				</ReactQueryProvider>
			</RainbowKitProvider>
		</WagmiConfig>
	</React.StrictMode>,
	document.getElementById('root')
)
