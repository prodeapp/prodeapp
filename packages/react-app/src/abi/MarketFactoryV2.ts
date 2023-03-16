export const MarketFactoryV2Abi = [
	{
		inputs: [
			{
				internalType: 'contract IRealityRegistry',
				name: '_realityRegistry',
				type: 'address',
			},
			{
				internalType: 'contract IKeyValue',
				name: '_keyValue',
				type: 'address',
			},
			{
				internalType: 'contract IMarketFactory',
				name: '_marketFactory',
				type: 'address',
			},
			{
				internalType: 'contract LiquidityFactory',
				name: '_liquidityFactory',
				type: 'address',
			},
		],
		stateMutability: 'nonpayable',
		type: 'constructor',
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
				internalType: 'contract IKeyValue',
				name: '_keyValue',
				type: 'address',
			},
		],
		name: 'changeKeyValue',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'contract IRealityRegistry',
				name: '_realityRegistry',
				type: 'address',
			},
		],
		name: 'changeRealityRegistry',
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
						internalType: 'uint32',
						name: 'openingTS',
						type: 'uint32',
					},
					{
						internalType: 'string',
						name: 'title',
						type: 'string',
					},
					{
						internalType: 'string',
						name: 'outcomes',
						type: 'string',
					},
					{
						internalType: 'string',
						name: 'category',
						type: 'string',
					},
					{
						internalType: 'string',
						name: 'language',
						type: 'string',
					},
				],
				internalType: 'struct MarketFactoryV2.QuestionMetadata[]',
				name: 'questionsMetadata',
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
						internalType: 'uint32',
						name: 'openingTS',
						type: 'uint32',
					},
					{
						internalType: 'string',
						name: 'title',
						type: 'string',
					},
					{
						internalType: 'string',
						name: 'outcomes',
						type: 'string',
					},
					{
						internalType: 'string',
						name: 'category',
						type: 'string',
					},
					{
						internalType: 'string',
						name: 'language',
						type: 'string',
					},
				],
				internalType: 'struct MarketFactoryV2.QuestionMetadata[]',
				name: 'questionsMetadata',
				type: 'tuple[]',
			},
			{
				internalType: 'uint16[]',
				name: 'prizeWeights',
				type: 'uint16[]',
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
				name: 'liquidityParameters',
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
		name: 'keyValue',
		outputs: [
			{
				internalType: 'contract IKeyValue',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'liquidityFactory',
		outputs: [
			{
				internalType: 'contract LiquidityFactory',
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
				internalType: 'contract IMarketFactory',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'realityRegistry',
		outputs: [
			{
				internalType: 'contract IRealityRegistry',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
] as const
