export const MarketFactoryAbi = [
	{
		inputs: [
			{
				internalType: 'address',
				name: '_market',
				type: 'address',
			},
			{
				internalType: 'address',
				name: '_arbitrator',
				type: 'address',
			},
			{
				internalType: 'address',
				name: '_realitio',
				type: 'address',
			},
			{
				internalType: 'address',
				name: '_nftDescriptor',
				type: 'address',
			},
			{
				internalType: 'address',
				name: '_manager',
				type: 'address',
			},
			{
				internalType: 'address',
				name: '_governor',
				type: 'address',
			},
			{
				internalType: 'address',
				name: '_protocolTraesury',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: '_protocolFee',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: '_submissionTimeout',
				type: 'uint256',
			},
		],
		stateMutability: 'nonpayable',
		type: 'constructor',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'market',
				type: 'address',
			},
			{
				indexed: true,
				internalType: 'bytes32',
				name: 'hash',
				type: 'bytes32',
			},
			{
				indexed: false,
				internalType: 'address',
				name: 'manager',
				type: 'address',
			},
		],
		name: 'NewMarket',
		type: 'event',
	},
	{
		inputs: [],
		name: 'QUESTION_TIMEOUT',
		outputs: [
			{
				internalType: 'uint32',
				name: '',
				type: 'uint32',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'allMarkets',
		outputs: [
			{
				internalType: 'contract Market[]',
				name: '',
				type: 'address[]',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'arbitrator',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_governor',
				type: 'address',
			},
		],
		name: 'changeGovernor',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_manager',
				type: 'address',
			},
		],
		name: 'changeManager',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '_protocolFee',
				type: 'uint256',
			},
		],
		name: 'changeProtocolFee',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_protocolTraesury',
				type: 'address',
			},
		],
		name: 'changeProtocolTreasury',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'string',
				name: 'marketName',
				type: 'string',
			},
			{
				internalType: 'string',
				name: 'marketSymbol',
				type: 'string',
			},
			{
				internalType: 'address',
				name: 'creator',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: 'creatorFee',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'closingTime',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'price',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'minBond',
				type: 'uint256',
			},
			{
				components: [
					{
						internalType: 'uint256',
						name: 'templateID',
						type: 'uint256',
					},
					{
						internalType: 'string',
						name: 'question',
						type: 'string',
					},
					{
						internalType: 'uint32',
						name: 'openingTS',
						type: 'uint32',
					},
				],
				internalType: 'struct MarketFactory.RealitioQuestion[]',
				name: 'questionsData',
				type: 'tuple[]',
			},
			{
				internalType: 'uint16[]',
				name: 'prizeWeights',
				type: 'uint16[]',
			},
		],
		name: 'createMarket',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'governor',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'manager',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'market',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'marketCount',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		name: 'markets',
		outputs: [
			{
				internalType: 'contract Market',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'nftDescriptor',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'protocolFee',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'protocolTraesury',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'realitio',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'submissionTimeout',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
] as const
