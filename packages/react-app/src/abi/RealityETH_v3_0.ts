export const RealityAbi = [
	{
		type: 'constructor',
		stateMutability: 'nonpayable',
		inputs: [],
	},
	{
		type: 'event',
		name: 'LogAnswerReveal',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
				indexed: true,
			},
			{
				type: 'address',
				name: 'user',
				internalType: 'address',
				indexed: true,
			},
			{
				type: 'bytes32',
				name: 'answer_hash',
				internalType: 'bytes32',
				indexed: true,
			},
			{
				type: 'bytes32',
				name: 'answer',
				internalType: 'bytes32',
				indexed: false,
			},
			{
				type: 'uint256',
				name: 'nonce',
				internalType: 'uint256',
				indexed: false,
			},
			{
				type: 'uint256',
				name: 'bond',
				internalType: 'uint256',
				indexed: false,
			},
		],
		anonymous: false,
	},
	{
		type: 'event',
		name: 'LogCancelArbitration',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
				indexed: true,
			},
		],
		anonymous: false,
	},
	{
		type: 'event',
		name: 'LogClaim',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
				indexed: true,
			},
			{
				type: 'address',
				name: 'user',
				internalType: 'address',
				indexed: true,
			},
			{
				type: 'uint256',
				name: 'amount',
				internalType: 'uint256',
				indexed: false,
			},
		],
		anonymous: false,
	},
	{
		type: 'event',
		name: 'LogFinalize',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
				indexed: true,
			},
			{
				type: 'bytes32',
				name: 'answer',
				internalType: 'bytes32',
				indexed: true,
			},
		],
		anonymous: false,
	},
	{
		type: 'event',
		name: 'LogFundAnswerBounty',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
				indexed: true,
			},
			{
				type: 'uint256',
				name: 'bounty_added',
				internalType: 'uint256',
				indexed: false,
			},
			{
				type: 'uint256',
				name: 'bounty',
				internalType: 'uint256',
				indexed: false,
			},
			{
				type: 'address',
				name: 'user',
				internalType: 'address',
				indexed: true,
			},
		],
		anonymous: false,
	},
	{
		type: 'event',
		name: 'LogMinimumBond',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
				indexed: true,
			},
			{
				type: 'uint256',
				name: 'min_bond',
				internalType: 'uint256',
				indexed: false,
			},
		],
		anonymous: false,
	},
	{
		type: 'event',
		name: 'LogNewAnswer',
		inputs: [
			{
				type: 'bytes32',
				name: 'answer',
				internalType: 'bytes32',
				indexed: false,
			},
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
				indexed: true,
			},
			{
				type: 'bytes32',
				name: 'history_hash',
				internalType: 'bytes32',
				indexed: false,
			},
			{
				type: 'address',
				name: 'user',
				internalType: 'address',
				indexed: true,
			},
			{
				type: 'uint256',
				name: 'bond',
				internalType: 'uint256',
				indexed: false,
			},
			{
				type: 'uint256',
				name: 'ts',
				internalType: 'uint256',
				indexed: false,
			},
			{
				type: 'bool',
				name: 'is_commitment',
				internalType: 'bool',
				indexed: false,
			},
		],
		anonymous: false,
	},
	{
		type: 'event',
		name: 'LogNewQuestion',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
				indexed: true,
			},
			{
				type: 'address',
				name: 'user',
				internalType: 'address',
				indexed: true,
			},
			{
				type: 'uint256',
				name: 'template_id',
				internalType: 'uint256',
				indexed: false,
			},
			{
				type: 'string',
				name: 'question',
				internalType: 'string',
				indexed: false,
			},
			{
				type: 'bytes32',
				name: 'content_hash',
				internalType: 'bytes32',
				indexed: true,
			},
			{
				type: 'address',
				name: 'arbitrator',
				internalType: 'address',
				indexed: false,
			},
			{
				type: 'uint32',
				name: 'timeout',
				internalType: 'uint32',
				indexed: false,
			},
			{
				type: 'uint32',
				name: 'opening_ts',
				internalType: 'uint32',
				indexed: false,
			},
			{
				type: 'uint256',
				name: 'nonce',
				internalType: 'uint256',
				indexed: false,
			},
			{
				type: 'uint256',
				name: 'created',
				internalType: 'uint256',
				indexed: false,
			},
		],
		anonymous: false,
	},
	{
		type: 'event',
		name: 'LogNewTemplate',
		inputs: [
			{
				type: 'uint256',
				name: 'template_id',
				internalType: 'uint256',
				indexed: true,
			},
			{
				type: 'address',
				name: 'user',
				internalType: 'address',
				indexed: true,
			},
			{
				type: 'string',
				name: 'question_text',
				internalType: 'string',
				indexed: false,
			},
		],
		anonymous: false,
	},
	{
		type: 'event',
		name: 'LogNotifyOfArbitrationRequest',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
				indexed: true,
			},
			{
				type: 'address',
				name: 'user',
				internalType: 'address',
				indexed: true,
			},
		],
		anonymous: false,
	},
	{
		type: 'event',
		name: 'LogReopenQuestion',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
				indexed: true,
			},
			{
				type: 'bytes32',
				name: 'reopened_question_id',
				internalType: 'bytes32',
				indexed: true,
			},
		],
		anonymous: false,
	},
	{
		type: 'event',
		name: 'LogSetQuestionFee',
		inputs: [
			{
				type: 'address',
				name: 'arbitrator',
				internalType: 'address',
				indexed: false,
			},
			{
				type: 'uint256',
				name: 'amount',
				internalType: 'uint256',
				indexed: false,
			},
		],
		anonymous: false,
	},
	{
		type: 'event',
		name: 'LogWithdraw',
		inputs: [
			{
				type: 'address',
				name: 'user',
				internalType: 'address',
				indexed: true,
			},
			{
				type: 'uint256',
				name: 'amount',
				internalType: 'uint256',
				indexed: false,
			},
		],
		anonymous: false,
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
		name: 'arbitrator_question_fees',
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
		stateMutability: 'payable',
		outputs: [
			{
				type: 'bytes32',
				name: '',
				internalType: 'bytes32',
			},
		],
		name: 'askQuestion',
		inputs: [
			{
				type: 'uint256',
				name: 'template_id',
				internalType: 'uint256',
			},
			{
				type: 'string',
				name: 'question',
				internalType: 'string',
			},
			{
				type: 'address',
				name: 'arbitrator',
				internalType: 'address',
			},
			{
				type: 'uint32',
				name: 'timeout',
				internalType: 'uint32',
			},
			{
				type: 'uint32',
				name: 'opening_ts',
				internalType: 'uint32',
			},
			{
				type: 'uint256',
				name: 'nonce',
				internalType: 'uint256',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'payable',
		outputs: [
			{
				type: 'bytes32',
				name: '',
				internalType: 'bytes32',
			},
		],
		name: 'askQuestionWithMinBond',
		inputs: [
			{
				type: 'uint256',
				name: 'template_id',
				internalType: 'uint256',
			},
			{
				type: 'string',
				name: 'question',
				internalType: 'string',
			},
			{
				type: 'address',
				name: 'arbitrator',
				internalType: 'address',
			},
			{
				type: 'uint32',
				name: 'timeout',
				internalType: 'uint32',
			},
			{
				type: 'uint32',
				name: 'opening_ts',
				internalType: 'uint32',
			},
			{
				type: 'uint256',
				name: 'nonce',
				internalType: 'uint256',
			},
			{
				type: 'uint256',
				name: 'min_bond',
				internalType: 'uint256',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'nonpayable',
		outputs: [],
		name: 'assignWinnerAndSubmitAnswerByArbitrator',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
			},
			{
				type: 'bytes32',
				name: 'answer',
				internalType: 'bytes32',
			},
			{
				type: 'address',
				name: 'payee_if_wrong',
				internalType: 'address',
			},
			{
				type: 'bytes32',
				name: 'last_history_hash',
				internalType: 'bytes32',
			},
			{
				type: 'bytes32',
				name: 'last_answer_or_commitment_id',
				internalType: 'bytes32',
			},
			{
				type: 'address',
				name: 'last_answerer',
				internalType: 'address',
			},
		],
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
		name: 'balanceOf',
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
		name: 'cancelArbitration',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'nonpayable',
		outputs: [],
		name: 'claimMultipleAndWithdrawBalance',
		inputs: [
			{
				type: 'bytes32[]',
				name: 'question_ids',
				internalType: 'bytes32[]',
			},
			{
				type: 'uint256[]',
				name: 'lengths',
				internalType: 'uint256[]',
			},
			{
				type: 'bytes32[]',
				name: 'hist_hashes',
				internalType: 'bytes32[]',
			},
			{
				type: 'address[]',
				name: 'addrs',
				internalType: 'address[]',
			},
			{
				type: 'uint256[]',
				name: 'bonds',
				internalType: 'uint256[]',
			},
			{
				type: 'bytes32[]',
				name: 'answers',
				internalType: 'bytes32[]',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'nonpayable',
		outputs: [],
		name: 'claimWinnings',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
			},
			{
				type: 'bytes32[]',
				name: 'history_hashes',
				internalType: 'bytes32[]',
			},
			{
				type: 'address[]',
				name: 'addrs',
				internalType: 'address[]',
			},
			{
				type: 'uint256[]',
				name: 'bonds',
				internalType: 'uint256[]',
			},
			{
				type: 'bytes32[]',
				name: 'answers',
				internalType: 'bytes32[]',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'view',
		outputs: [
			{
				type: 'uint32',
				name: 'reveal_ts',
				internalType: 'uint32',
			},
			{
				type: 'bool',
				name: 'is_revealed',
				internalType: 'bool',
			},
			{
				type: 'bytes32',
				name: 'revealed_answer',
				internalType: 'bytes32',
			},
		],
		name: 'commitments',
		inputs: [
			{
				type: 'bytes32',
				name: '',
				internalType: 'bytes32',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'nonpayable',
		outputs: [
			{
				type: 'uint256',
				name: '',
				internalType: 'uint256',
			},
		],
		name: 'createTemplate',
		inputs: [
			{
				type: 'string',
				name: 'content',
				internalType: 'string',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'payable',
		outputs: [
			{
				type: 'bytes32',
				name: '',
				internalType: 'bytes32',
			},
		],
		name: 'createTemplateAndAskQuestion',
		inputs: [
			{
				type: 'string',
				name: 'content',
				internalType: 'string',
			},
			{
				type: 'string',
				name: 'question',
				internalType: 'string',
			},
			{
				type: 'address',
				name: 'arbitrator',
				internalType: 'address',
			},
			{
				type: 'uint32',
				name: 'timeout',
				internalType: 'uint32',
			},
			{
				type: 'uint32',
				name: 'opening_ts',
				internalType: 'uint32',
			},
			{
				type: 'uint256',
				name: 'nonce',
				internalType: 'uint256',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'payable',
		outputs: [],
		name: 'fundAnswerBounty',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
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
		name: 'getArbitrator',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'view',
		outputs: [
			{
				type: 'bytes32',
				name: '',
				internalType: 'bytes32',
			},
		],
		name: 'getBestAnswer',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
			},
		],
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
		name: 'getBond',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
			},
		],
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
		name: 'getBounty',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'view',
		outputs: [
			{
				type: 'bytes32',
				name: '',
				internalType: 'bytes32',
			},
		],
		name: 'getContentHash',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'view',
		outputs: [
			{
				type: 'bytes32',
				name: '',
				internalType: 'bytes32',
			},
		],
		name: 'getFinalAnswer',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'view',
		outputs: [
			{
				type: 'bytes32',
				name: '',
				internalType: 'bytes32',
			},
		],
		name: 'getFinalAnswerIfMatches',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
			},
			{
				type: 'bytes32',
				name: 'content_hash',
				internalType: 'bytes32',
			},
			{
				type: 'address',
				name: 'arbitrator',
				internalType: 'address',
			},
			{
				type: 'uint32',
				name: 'min_timeout',
				internalType: 'uint32',
			},
			{
				type: 'uint256',
				name: 'min_bond',
				internalType: 'uint256',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'view',
		outputs: [
			{
				type: 'uint32',
				name: '',
				internalType: 'uint32',
			},
		],
		name: 'getFinalizeTS',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'view',
		outputs: [
			{
				type: 'bytes32',
				name: '',
				internalType: 'bytes32',
			},
		],
		name: 'getHistoryHash',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
			},
		],
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
		name: 'getMinBond',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'view',
		outputs: [
			{
				type: 'uint32',
				name: '',
				internalType: 'uint32',
			},
		],
		name: 'getOpeningTS',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'view',
		outputs: [
			{
				type: 'uint32',
				name: '',
				internalType: 'uint32',
			},
		],
		name: 'getTimeout',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
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
		name: 'isFinalized',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
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
		name: 'isPendingArbitration',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
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
		name: 'isSettledTooSoon',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'nonpayable',
		outputs: [],
		name: 'notifyOfArbitrationRequest',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
			},
			{
				type: 'address',
				name: 'requester',
				internalType: 'address',
			},
			{
				type: 'uint256',
				name: 'max_previous',
				internalType: 'uint256',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'view',
		outputs: [
			{
				type: 'address',
				name: 'payee',
				internalType: 'address',
			},
			{
				type: 'uint256',
				name: 'last_bond',
				internalType: 'uint256',
			},
			{
				type: 'uint256',
				name: 'queued_funds',
				internalType: 'uint256',
			},
		],
		name: 'question_claims',
		inputs: [
			{
				type: 'bytes32',
				name: '',
				internalType: 'bytes32',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'view',
		outputs: [
			{
				type: 'bytes32',
				name: 'content_hash',
				internalType: 'bytes32',
			},
			{
				type: 'address',
				name: 'arbitrator',
				internalType: 'address',
			},
			{
				type: 'uint32',
				name: 'opening_ts',
				internalType: 'uint32',
			},
			{
				type: 'uint32',
				name: 'timeout',
				internalType: 'uint32',
			},
			{
				type: 'uint32',
				name: 'finalize_ts',
				internalType: 'uint32',
			},
			{
				type: 'bool',
				name: 'is_pending_arbitration',
				internalType: 'bool',
			},
			{
				type: 'uint256',
				name: 'bounty',
				internalType: 'uint256',
			},
			{
				type: 'bytes32',
				name: 'best_answer',
				internalType: 'bytes32',
			},
			{
				type: 'bytes32',
				name: 'history_hash',
				internalType: 'bytes32',
			},
			{
				type: 'uint256',
				name: 'bond',
				internalType: 'uint256',
			},
			{
				type: 'uint256',
				name: 'min_bond',
				internalType: 'uint256',
			},
		],
		name: 'questions',
		inputs: [
			{
				type: 'bytes32',
				name: '',
				internalType: 'bytes32',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'payable',
		outputs: [
			{
				type: 'bytes32',
				name: '',
				internalType: 'bytes32',
			},
		],
		name: 'reopenQuestion',
		inputs: [
			{
				type: 'uint256',
				name: 'template_id',
				internalType: 'uint256',
			},
			{
				type: 'string',
				name: 'question',
				internalType: 'string',
			},
			{
				type: 'address',
				name: 'arbitrator',
				internalType: 'address',
			},
			{
				type: 'uint32',
				name: 'timeout',
				internalType: 'uint32',
			},
			{
				type: 'uint32',
				name: 'opening_ts',
				internalType: 'uint32',
			},
			{
				type: 'uint256',
				name: 'nonce',
				internalType: 'uint256',
			},
			{
				type: 'uint256',
				name: 'min_bond',
				internalType: 'uint256',
			},
			{
				type: 'bytes32',
				name: 'reopens_question_id',
				internalType: 'bytes32',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'view',
		outputs: [
			{
				type: 'bytes32',
				name: '',
				internalType: 'bytes32',
			},
		],
		name: 'reopened_questions',
		inputs: [
			{
				type: 'bytes32',
				name: '',
				internalType: 'bytes32',
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
		name: 'reopener_questions',
		inputs: [
			{
				type: 'bytes32',
				name: '',
				internalType: 'bytes32',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'view',
		outputs: [
			{
				type: 'bytes32',
				name: '',
				internalType: 'bytes32',
			},
		],
		name: 'resultFor',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'view',
		outputs: [
			{
				type: 'bytes32',
				name: '',
				internalType: 'bytes32',
			},
		],
		name: 'resultForOnceSettled',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'nonpayable',
		outputs: [],
		name: 'setQuestionFee',
		inputs: [
			{
				type: 'uint256',
				name: 'fee',
				internalType: 'uint256',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'payable',
		outputs: [],
		name: 'submitAnswer',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
			},
			{
				type: 'bytes32',
				name: 'answer',
				internalType: 'bytes32',
			},
			{
				type: 'uint256',
				name: 'max_previous',
				internalType: 'uint256',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'nonpayable',
		outputs: [],
		name: 'submitAnswerByArbitrator',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
			},
			{
				type: 'bytes32',
				name: 'answer',
				internalType: 'bytes32',
			},
			{
				type: 'address',
				name: 'answerer',
				internalType: 'address',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'payable',
		outputs: [],
		name: 'submitAnswerCommitment',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
			},
			{
				type: 'bytes32',
				name: 'answer_hash',
				internalType: 'bytes32',
			},
			{
				type: 'uint256',
				name: 'max_previous',
				internalType: 'uint256',
			},
			{
				type: 'address',
				name: '_answerer',
				internalType: 'address',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'payable',
		outputs: [],
		name: 'submitAnswerFor',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
			},
			{
				type: 'bytes32',
				name: 'answer',
				internalType: 'bytes32',
			},
			{
				type: 'uint256',
				name: 'max_previous',
				internalType: 'uint256',
			},
			{
				type: 'address',
				name: 'answerer',
				internalType: 'address',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'nonpayable',
		outputs: [],
		name: 'submitAnswerReveal',
		inputs: [
			{
				type: 'bytes32',
				name: 'question_id',
				internalType: 'bytes32',
			},
			{
				type: 'bytes32',
				name: 'answer',
				internalType: 'bytes32',
			},
			{
				type: 'uint256',
				name: 'nonce',
				internalType: 'uint256',
			},
			{
				type: 'uint256',
				name: 'bond',
				internalType: 'uint256',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'view',
		outputs: [
			{
				type: 'bytes32',
				name: '',
				internalType: 'bytes32',
			},
		],
		name: 'template_hashes',
		inputs: [
			{
				type: 'uint256',
				name: '',
				internalType: 'uint256',
			},
		],
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
		name: 'templates',
		inputs: [
			{
				type: 'uint256',
				name: '',
				internalType: 'uint256',
			},
		],
	},
	{
		type: 'function',
		stateMutability: 'nonpayable',
		outputs: [],
		name: 'withdraw',
		inputs: [],
	},
] as const
