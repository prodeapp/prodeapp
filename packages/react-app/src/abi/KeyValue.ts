export const KeyValueAbi = [
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'address',
				name: 'marketId',
				type: 'address',
			},
		],
		name: 'MarketDeleted',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'address',
				name: 'marketId',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'address',
				name: 'creator',
				type: 'address',
			},
		],
		name: 'SetMarketCreator',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'address',
				name: 'userId',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'string',
				name: 'username',
				type: 'string',
			},
		],
		name: 'SetUsername',
		type: 'event',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_marketFactoryV2',
				type: 'address',
			},
		],
		name: 'changeMarketFactory',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_owner',
				type: 'address',
			},
		],
		name: 'changeOwner',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'marketId',
				type: 'address',
			},
		],
		name: 'deleteMarket',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address[]',
				name: 'marketIds',
				type: 'address[]',
			},
		],
		name: 'deleteMarkets',
		outputs: [],
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
		name: 'marketCreator',
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
				name: '',
				type: 'address',
			},
		],
		name: 'marketDeleted',
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
		inputs: [],
		name: 'marketFactoryV2',
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
		name: 'owner',
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
				name: 'marketId',
				type: 'address',
			},
			{
				internalType: 'address',
				name: 'creator',
				type: 'address',
			},
		],
		name: 'setMarketCreator',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'userId',
				type: 'address',
			},
			{
				internalType: 'string',
				name: 'name',
				type: 'string',
			},
		],
		name: 'setUsername',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address[]',
				name: 'userIds',
				type: 'address[]',
			},
			{
				internalType: 'string[]',
				name: 'names',
				type: 'string[]',
			},
		],
		name: 'setUsernames',
		outputs: [],
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
		name: 'username',
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
				internalType: 'string',
				name: '',
				type: 'string',
			},
		],
		name: 'usernameExists',
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
] as const
