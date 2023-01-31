export const SVGAbi = [
	{
		inputs: [],
		stateMutability: 'nonpayable',
		type: 'constructor',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_market',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: '_tokenID',
				type: 'uint256',
			},
		],
		name: 'getRef',
		outputs: [
			{
				internalType: 'string',
				name: '',
				type: 'string',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_market',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: '_tokenID',
				type: 'uint256',
			},
		],
		name: 'getSVG',
		outputs: [
			{
				internalType: 'string',
				name: '',
				type: 'string',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'bytes32',
				name: '_itemID',
				type: 'bytes32',
			},
			{
				internalType: 'bytes32',
				name: '_proxyItemID',
				type: 'bytes32',
			},
			{
				internalType: 'string',
				name: '_svg',
				type: 'string',
			},
			{
				internalType: 'string',
				name: '_ref',
				type: 'string',
			},
		],
		name: 'initialize',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'itemID',
		outputs: [
			{
				internalType: 'bytes32',
				name: '',
				type: 'bytes32',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'proxyItemID',
		outputs: [
			{
				internalType: 'bytes32',
				name: '',
				type: 'bytes32',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
] as const
