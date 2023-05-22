import { Chain, Wallet } from '@rainbow-me/rainbowkit'
import { InjectedConnector } from 'wagmi/connectors/injected'

import logo from '@/assets/ripioPortalWallet.svg'

export interface RipioPortalWalletOptions {
	chains: Chain[]
	shimDisconnect?: boolean
}

export const ripioPortalWallet = ({ chains, shimDisconnect }: RipioPortalWalletOptions): Wallet => ({
	id: 'ripioPortal',
	name: 'Ripio Portal',
	iconUrl: logo,
	iconAccent: '#65ffb5',
	iconBackground: '#ffffff',
	installed: typeof window !== 'undefined' && window.ethereum?.isPortal === true,
	downloadUrls: {
		browserExtension: 'https://chrome.google.com/webstore/detail/ripio-portal/ddamhapapianibkkkcclabgicmpnpdnj',
	},
	createConnector: () => ({
		connector: new InjectedConnector({
			chains,
			options: { shimDisconnect },
		}),
	}),
})
