import '@rainbow-me/rainbowkit/styles.css'

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

gnosis.contracts = {
	multicall3: {
		address: '0xca11bde05977b3631167028862be2a173976ca11',
		blockCreated: 21022491,
	},
}

export const { chains, provider } = configureChains(
	[gnosis, arbitrum, optimism, polygon, bsc, polygonMumbai],
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
		groupName: 'Recommended',
		wallets: [
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
