import { Address } from '@wagmi/core'
import { arbitrum, bsc, optimism, polygon } from '@wagmi/core/chains'

import { NetworkId } from '@/lib/config'
import { SdkConfig } from '@/lib/connext/config'

const GNOSIS_DOMAIN_ID = '6778479'

const CROSS_CHAIN_CONFIG: Record<number, { DOMAIN_ID: string; CONNEXT: Address; DAI: Address }> = {
	[NetworkId.ARBITRUM]: {
		DOMAIN_ID: '1634886255',
		CONNEXT: '0xEE9deC2712cCE65174B561151701Bf54b99C24C8',
		DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
	},
	[NetworkId.OPTIMISM]: {
		DOMAIN_ID: '1869640809',
		CONNEXT: '0x8f7492DE823025b4CfaAB1D34c58963F2af5DEDA',
		DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
	},
	[NetworkId.POLYGON]: {
		DOMAIN_ID: '1886350457',
		CONNEXT: '0x11984dc4465481512eb5b777E44061C158CF2259',
		DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
	},
	[NetworkId.BSC]: {
		DOMAIN_ID: '6450786',
		CONNEXT: '0xCd401c10afa37d641d2F594852DA94C700e4F2CE',
		DAI: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
	},
	[NetworkId.OPTIMISM_TESTNET]: {
		DOMAIN_ID: '1735356532',
		CONNEXT: '0x5Ea1bb242326044699C3d81341c5f535d5Af1504',
		DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
	},
}

function buildSdkConfig(): SdkConfig {
	// Create a Signer and connect it to a Provider on the sending chain
	//const privateKey = "<PRIVATE_KEY>";

	//let signer = new ethers.Wallet(privateKey);

	// Use the RPC url for the origin chain
	//const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth_goerli");
	//signer = signer.connect(provider);
	//const signerAddress = await signer.getAddress();

	return {
		//signerAddress: signerAddress,
		network: 'mainnet',
		chains: {
			[CROSS_CHAIN_CONFIG[NetworkId.ARBITRUM].DOMAIN_ID]: {
				providers: arbitrum.rpcUrls.default.http,
			},
			[CROSS_CHAIN_CONFIG[NetworkId.OPTIMISM].DOMAIN_ID]: {
				providers: optimism.rpcUrls.default.http,
			},
			[CROSS_CHAIN_CONFIG[NetworkId.POLYGON].DOMAIN_ID]: {
				providers: polygon.rpcUrls.default.http,
			},
			[CROSS_CHAIN_CONFIG[NetworkId.BSC].DOMAIN_ID]: {
				providers: bsc.rpcUrls.default.http,
			},
		},
	}
}

const sdkConfig = buildSdkConfig()

export { sdkConfig, CROSS_CHAIN_CONFIG, GNOSIS_DOMAIN_ID }
