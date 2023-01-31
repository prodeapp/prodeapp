export const VoucherManagerAbi = [
	{
		type: 'constructor',
		inputs: [],
	},
	{
		type: 'function',
		stateMutability: 'view',
		outputs: [
			{
				type: 'uint256',
				name: '',
				internalType: 'uint256',
			},
		],
		name: 'balance',
		inputs: [
			{
				type: 'address',
				name: '',
				internalType: 'address',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'nonpayable',
		outputs: [],
		name: 'changeOwner',
		inputs: [
			{
				type: 'address',
				name: '_owner',
				internalType: 'address',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'payable',
		outputs: [],
		name: 'fundAddress',
		inputs: [
			{
				type: 'address',
				name: '_to',
				internalType: 'address',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'view',
		outputs: [
			{
				type: 'bool',
				name: '',
				internalType: 'bool',
			},
		],
		name: 'marketsWhitelist',
		inputs: [
			{
				type: 'address',
				name: '',
				internalType: 'address',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'view',
		outputs: [
			{
				type: 'address',
				name: '',
				internalType: 'address',
			},
		],
		name: 'owner',
		inputs: [],
	},
	{
		type: 'function',
		stateMutability: 'payable',
		outputs: [
			{
				type: 'uint256',
				name: '',
				internalType: 'uint256',
			},
		],
		name: 'placeBet',
		inputs: [
			{
				type: 'address',
				name: '_market',
				internalType: 'address',
			},
			{
				type: 'address',
				name: '_attribution',
				internalType: 'address',
			},
			{
				type: 'bytes32[]',
				name: '_results',
				internalType: 'bytes32[]',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'nonpayable',
		outputs: [],
		name: 'transferVoucher',
		inputs: [
			{
				type: 'address',
				name: '_from',
				internalType: 'address',
			},
			{
				type: 'address',
				name: '_to',
				internalType: 'address',
			},
			{
				type: 'uint256',
				name: '_amount',
				internalType: 'uint256',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'nonpayable',
		outputs: [],
		name: 'whitelistMarket',
		inputs: [
			{
				type: 'address',
				name: '_market',
				internalType: 'address',
			},
		],
	},
	{
		type: 'event',
		name: 'FundingReceived',
		inputs: [
			{
				type: 'address',
				name: '_from',
				indexed: true,
			},
			{
				type: 'address',
				name: '_to',
				indexed: true,
			},
			{
				type: 'uint256',
				name: '_amount',
				indexed: false,
			},
		],
		anonymous: false,
	},
	{
		type: 'event',
		name: 'MarketWhitelisted',
		inputs: [
			{
				type: 'address',
				name: '_market',
				indexed: true,
			},
		],
		anonymous: false,
	},
	{
		type: 'event',
		name: 'VoucherTransfered',
		inputs: [
			{
				type: 'address',
				name: '_from',
				indexed: true,
			},
			{
				type: 'address',
				name: '_to',
				indexed: true,
			},
			{
				type: 'uint256',
				name: '_amount',
				indexed: false,
			},
		],
		anonymous: false,
	},
	{
		type: 'event',
		name: 'VoucherUsed',
		inputs: [
			{
				type: 'address',
				name: '_player',
				indexed: true,
			},
			{
				type: 'address',
				name: '_market',
				indexed: true,
			},
			{
				type: 'uint256',
				name: '_tokenId',
				indexed: true,
			},
		],
		anonymous: false,
	},
] as const;
