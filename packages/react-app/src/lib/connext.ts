import { SdkConfig } from '@connext/sdk'
import { Address } from '@wagmi/core'
import { arbitrum, bsc, optimism, polygon } from '@wagmi/core/chains'

import { NetworkId } from '@/lib/config'

const GNOSIS_DOMAIN_ID = '6778479'

const CROSSCHAIN_CONFIG: Record<number, { DOMAIN_ID: string; CONNEXT: Address; USDC: Address }> = {
	[NetworkId.ARBITRUM]: {
		DOMAIN_ID: '1634886255',
		CONNEXT: '0xEE9deC2712cCE65174B561151701Bf54b99C24C8',
		USDC: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
	},
	[NetworkId.OPTIMISM]: {
		DOMAIN_ID: '1869640809',
		CONNEXT: '0x8f7492DE823025b4CfaAB1D34c58963F2af5DEDA',
		USDC: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
	},
	[NetworkId.POLYGON]: {
		DOMAIN_ID: '1886350457',
		CONNEXT: '0x11984dc4465481512eb5b777E44061C158CF2259',
		USDC: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
	},
	[NetworkId.BSC]: {
		DOMAIN_ID: '6450786',
		CONNEXT: '0xCd401c10afa37d641d2F594852DA94C700e4F2CE',
		USDC: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
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
			[CROSSCHAIN_CONFIG[NetworkId.ARBITRUM].DOMAIN_ID]: {
				providers: arbitrum.rpcUrls.default.http,
			},
			[CROSSCHAIN_CONFIG[NetworkId.OPTIMISM].DOMAIN_ID]: {
				providers: optimism.rpcUrls.default.http,
			},
			[CROSSCHAIN_CONFIG[NetworkId.POLYGON].DOMAIN_ID]: {
				providers: polygon.rpcUrls.default.http,
			},
			[CROSSCHAIN_CONFIG[NetworkId.BSC].DOMAIN_ID]: {
				providers: bsc.rpcUrls.default.http,
			},
		},
	}
}

const sdkConfig = buildSdkConfig()

export { sdkConfig, CROSSCHAIN_CONFIG, GNOSIS_DOMAIN_ID }