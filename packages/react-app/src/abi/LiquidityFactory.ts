export const LiquidityFactoryAbi = [
	{
		inputs: [
			{
				internalType: 'address',
				name: '_marketFactory',
				type: 'address',
			},
			{
				internalType: 'address',
				name: '_liquidityPool',
				type: 'address',
			},
			{
				internalType: 'address',
				name: '_governor',
				type: 'address',
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
				name: 'pool',
				type: 'address',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'market',
				type: 'address',
			},
		],
		name: 'NewLiquidityPool',
		type: 'event',
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
				name: '_liquidityPool',
				type: 'address',
			},
		],
		name: 'changeLiquidityPool',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				components: [
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
				internalType: 'struct LiquidityFactory.MarketParameters',
				name: '_marketParameters',
				type: 'tuple',
			},
			{
				components: [
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
						name: 'betMultiplier',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'pointsToWin',
						type: 'uint256',
					},
				],
				internalType: 'struct LiquidityFactory.LiquidityParameters',
				name: '_liquidityParameters',
				type: 'tuple',
			},
		],
		name: 'createMarketWithLiquidityPool',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
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
		inputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		name: 'exists',
		outputs: [
			{
				internalType: 'bool',
				name: '',
				type: 'bool',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '_from',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: '_to',
				type: 'uint256',
			},
		],
		name: 'getPools',
		outputs: [
			{
				internalType: 'contract LiquidityPool[]',
				name: 'poolsSlice',
				type: 'address[]',
			},
		],
		stateMutability: 'view',
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
		name: 'liquidityPool',
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
		name: 'marketFactory',
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
		name: 'poolCount',
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
		name: 'pools',
		outputs: [
			{
				internalType: 'contract LiquidityPool',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
] as const
