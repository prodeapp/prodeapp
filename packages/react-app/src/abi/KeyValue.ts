export const KeyValueAbi = [
	{
		type: 'constructor',
		stateMutability: 'nonpayable',
		inputs: [],
	},
	{
		type: 'function',
		stateMutability: 'nonpayable',
		outputs: [],
		name: 'setValue',
		inputs: [
			{
				type: 'string',
				name: 'key',
				internalType: 'string',
			},
			{
				type: 'string',
				name: 'value',
				internalType: 'string',
			},
		],
	},
	{
		type: 'event',
		name: 'SetValue',
		inputs: [
			{
				type: 'string',
				name: 'key',
				indexed: false,
			},
			{
				type: 'string',
				name: 'value',
				indexed: false,
			},
		],
		anonymous: false,
	},
] as const;
