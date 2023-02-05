import '@rainbow-me/rainbowkit/styles.css'

import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
	braveWallet,
	injectedWallet,
	metaMaskWallet,
	rainbowWallet,
	walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { gnosis } from '@wagmi/core/chains'
import { configureChains, createClient } from 'wagmi'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { publicProvider } from 'wagmi/providers/public'

gnosis.contracts = {
	multicall3: {
		address: '0xca11bde05977b3631167028862be2a173976ca11',
		blockCreated: 21022491,
	},
}

export const { chains, provider } = configureChains(
	[gnosis],
	[
		jsonRpcProvider({
			rpc: () => {
				return { http: 'https://rpc.gnosischain.com' }
			},
		}),
		jsonRpcProvider({
			rpc: () => {
				return { http: 'https://xdai-rpc.gateway.pokt.network' }
			},
		}),
		jsonRpcProvider({
			rpc: () => {
				return { http: 'https://rpc.ankr.com/gnosis' }
			},
		}),
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
