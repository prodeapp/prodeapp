export const MarketViewAbi = [
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
		],
		stateMutability: 'nonpayable',
		type: 'constructor',
	},
	{
		inputs: [],
		name: 'DIVISOR',
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
				internalType: 'address',
				name: 'marketId',
				type: 'address',
			},
		],
		name: 'getEvents',
		outputs: [
			{
				components: [
					{
						internalType: 'bytes32',
						name: 'id',
						type: 'bytes32',
					},
					{
						internalType: 'address',
						name: 'arbitrator',
						type: 'address',
					},
					{
						internalType: 'bytes32',
						name: 'answer',
						type: 'bytes32',
					},
					{
						internalType: 'uint256',
						name: 'openingTs',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'answerFinalizedTimestamp',
						type: 'uint256',
					},
					{
						internalType: 'bool',
						name: 'isPendingArbitration',
						type: 'bool',
					},
					{
						internalType: 'uint256',
						name: 'timeout',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'minBond',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'lastBond',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'bounty',
						type: 'uint256',
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
					{
						internalType: 'uint256',
						name: 'templateId',
						type: 'uint256',
					},
				],
				internalType: 'struct MarketView.EventInfo[]',
				name: '',
				type: 'tuple[]',
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
		],
		name: 'getMarket',
		outputs: [
			{
				internalType: 'address',
				name: 'id',
				type: 'address',
			},
			{
				components: [
					{
						internalType: 'string',
						name: 'name',
						type: 'string',
					},
					{
						internalType: 'bytes32',
						name: 'hash',
						type: 'bytes32',
					},
					{
						internalType: 'uint256',
						name: 'price',
						type: 'uint256',
					},
					{
						internalType: 'address',
						name: 'creator',
						type: 'address',
					},
					{
						internalType: 'uint256[]',
						name: 'prizes',
						type: 'uint256[]',
					},
					{
						internalType: 'uint256',
						name: 'numOfBets',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'pool',
						type: 'uint256',
					},
					{
						internalType: 'bool',
						name: 'curated',
						type: 'bool',
					},
				],
				internalType: 'struct MarketView.BaseInfo',
				name: 'baseInfo',
				type: 'tuple',
			},
			{
				components: [
					{
						internalType: 'address',
						name: 'managerId',
						type: 'address',
					},
					{
						internalType: 'uint256',
						name: 'managementRewards',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'managementFee',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'protocolFee',
						type: 'uint256',
					},
				],
				internalType: 'struct MarketView.ManagerInfo',
				name: 'managerInfo',
				type: 'tuple',
			},
			{
				components: [
					{
						internalType: 'uint256',
						name: 'closingTime',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'resultSubmissionPeriodStart',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'submissionTimeout',
						type: 'uint256',
					},
				],
				internalType: 'struct MarketView.PeriodsInfo',
				name: 'periodsInfo',
				type: 'tuple',
			},
			{
				components: [
					{
						internalType: 'uint256',
						name: 'numOfEvents',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'numOfEventsWithAnswer',
						type: 'uint256',
					},
					{
						internalType: 'bool',
						name: 'hasPendingAnswers',
						type: 'bool',
					},
				],
				internalType: 'struct MarketView.EventsInfo',
				name: 'eventsInfo',
				type: 'tuple',
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
		],
		name: 'getMarketBets',
		outputs: [
			{
				components: [
					{
						internalType: 'address',
						name: 'marketId',
						type: 'address',
					},
					{
						internalType: 'string',
						name: 'marketName',
						type: 'string',
					},
					{
						internalType: 'uint256',
						name: 'tokenId',
						type: 'uint256',
					},
					{
						internalType: 'address',
						name: 'owner',
						type: 'address',
					},
					{
						internalType: 'string',
						name: 'ownerName',
						type: 'string',
					},
					{
						internalType: 'uint256',
						name: 'points',
						type: 'uint256',
					},
					{
						internalType: 'bytes32[]',
						name: 'predictions',
						type: 'bytes32[]',
					},
				],
				internalType: 'struct MarketView.BetInfo[]',
				name: '',
				type: 'tuple[]',
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
				internalType: 'uint256',
				name: 'tokenId',
				type: 'uint256',
			},
		],
		name: 'getTokenBet',
		outputs: [
			{
				components: [
					{
						internalType: 'address',
						name: 'marketId',
						type: 'address',
					},
					{
						internalType: 'string',
						name: 'marketName',
						type: 'string',
					},
					{
						internalType: 'uint256',
						name: 'tokenId',
						type: 'uint256',
					},
					{
						internalType: 'address',
						name: 'owner',
						type: 'address',
					},
					{
						internalType: 'string',
						name: 'ownerName',
						type: 'string',
					},
					{
						internalType: 'uint256',
						name: 'points',
						type: 'uint256',
					},
					{
						internalType: 'bytes32[]',
						name: 'predictions',
						type: 'bytes32[]',
					},
				],
				internalType: 'struct MarketView.BetInfo',
				name: 'betInfo',
				type: 'tuple',
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
