import '@rainbow-me/rainbowkit/styles.css'

import { sequenceWallet } from '@0xsequence/rainbowkit-plugin'
import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
	braveWallet,
	injectedWallet,
	metaMaskWallet,
	rainbowWallet,
	walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { arbitrum, bsc, gnosis, optimism, polygon, polygonMumbai } from '@wagmi/core/chains'
import { alchemyProvider } from '@wagmi/core/providers/alchemy'
import { infuraProvider } from '@wagmi/core/providers/infura'
import { configureChains, createClient } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'

import { DEFAULT_CHAIN } from './config'

gnosis.contracts = {
	multicall3: {
		address: '0xca11bde05977b3631167028862be2a173976ca11',
		blockCreated: 21022491,
	},
}

const isProd = ['prode.market', 'prode.eth.limo', 'prode.eth.link'].includes(window.location.hostname)

export const { chains, provider } = configureChains(
	[
		{ ...gnosis, iconUrl: '/chains/gnosis.svg' },
		arbitrum,
		optimism,
		polygon,
		{ ...bsc, iconUrl: '/chains/bsc.svg' },
		...(!isProd ? [polygonMumbai] : []),
	],
	[
		...(import.meta.env.VITE_ALCHEMY_API_KEY
			? [alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY_API_KEY })]
			: []),
		...(import.meta.env.VITE_INFURA_API_KEY ? [infuraProvider({ apiKey: import.meta.env.VITE_INFURA_API_KEY })] : []),
		publicProvider(),
	],
	{
		stallTimeout: 2000,
	}
)

const needsInjectedWalletFallback =
	typeof window !== 'undefined' && window.ethereum && !window.ethereum.isMetaMask && !window.ethereum.isCoinbaseWallet

const connectors = connectorsForWallets([
	{
		groupName: 'Social Login',
		wallets: [
			sequenceWallet({
				chains: chains,
				connect: {
					app: 'Prode',
					networkId: DEFAULT_CHAIN,
					settings: {
						signInOptions: ['email', 'google', 'apple'],
					},
				},
			}),
		],
	},
	{
		groupName: 'External Wallets',
		wallets: [
			sequenceWallet({
				chains,
				connect: {
					app: 'Prode',
					networkId: DEFAULT_CHAIN,
					settings: {
						signInOptions: ['email', 'google', 'apple'],
					},
				},
			}),
			metaMaskWallet({ chains, shimDisconnect: true }),
			braveWallet({ chains, shimDisconnect: true }),
			rainbowWallet({ chains }),
			walletConnectWallet({ chains }),
			...(needsInjectedWalletFallback ? [injectedWallet({ chains, shimDisconnect: true })] : []),
		],
	},
])

export const wagmiClient = createClient({
	autoConnect: true,
	connectors,
	provider,
})
