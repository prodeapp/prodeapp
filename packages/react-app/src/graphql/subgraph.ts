import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
import { Address } from '@wagmi/core'

import { Bytes } from '@/abi/types'

export interface GraphMarket {
	id: Address
	creator: string
}

export const MARKET_FIELDS = `
    fragment MarketFields on Market {
      id
      creator
    }
`

export interface Market {
	id: Address
	hash: Bytes
	name: string
	price: BigNumber
	numOfBets: number
	closingTime: number
	resultSubmissionPeriodStart: number
	pool: BigNumber
	prizes: number[]
	manager: {
		id: string
		managementRewards: BigNumber
	}
	managementFee: number
	protocolFee: number
	submissionTimeout: number
	numOfEvents: number
	numOfEventsWithAnswer: number
	hasPendingAnswers: boolean
	creator: Address
	curated: boolean
	liquidityInfo: {
		id: Address
		creator: Address
		creatorFee: number
		pointsToWin: number
		betMultiplier: BigNumber
		totalDeposits: BigNumber
		prizePool: BigNumber
	}
}

export type Outcome = string

export interface Event {
	id: Address
	arbitrator: Address
	answer: string | null
	openingTs: number
	answerFinalizedTimestamp: number
	isPendingArbitration: boolean
	timeout: number
	minBond: BigNumber
	lastBond: BigNumber
	bounty: BigNumber
	category: string
	title: string
	outcomes: Outcome[]
	templateID: string
}

export interface Player {
	id: string
	name: string
}

export interface PlayerStats {
	id: string
	amountBet: BigNumberish
	pricesReceived: BigNumberish
	totalAttributions: BigNumberish
}

export const PLAYER_STATS_FIELDS = `
  fragment PlayerStatsFields on Player {
    id
    amountBet
    pricesReceived
    totalAttributions
  }
`

export interface Attribution {
	id: string
	market: {
		id: string
		name: string
	}
	amount: BigNumberish
	attributor: {
		id: string
	}
	timestamp: BigNumberish
	claimed: boolean
}

export const ATTRIBUTION_FIELDS = `
  fragment AttributionFields on Attribution {
    id
    market{id, name}
    amount
    attributor{id}
    timestamp
    claimed
  }
`

export interface MarketReferral {
	id: string
	market: {
		id: string
		name: string
		resultSubmissionPeriodStart: string
	}
	totalAmount: BigNumberish
	claimed: boolean
	manager: Address
	attributions: [
		{
			id: string
			attributor: { id: string }
			amount: BigNumberish
		}
	]
}

export const MARKETREFERRAL_FIELDS = `
  fragment MarketReferralFields on MarketReferral {
    id
    market{id, name, resultSubmissionPeriodStart}
    totalAmount
    attributions{id, attributor{id}, amount}
    claimed
    manager
  }
`

export interface Leaderboard extends Player, PlayerStats {
	numOfMarkets: string
	numOfBets: string
	name: string
	bets: {
		id: string
		results: string[]
		tokenID: BigNumberish
		points: BigNumberish
		reward: BigNumberish
		market: {
			id: string
			name: string
			events: {
				answer: string
				id: string
			}
		}
	}
}

export const LEADERBOARD_FIELDS = `
  ${PLAYER_STATS_FIELDS}
  fragment LeaderboardFields on Player {
    ...PlayerStatsFields
    numOfMarkets
    numOfBets
	name
    bets{
      id
      results
      tokenID
      points
      reward
      market {
        id
        name
        events {
          answer
          id
        }
      }
    }
  }
`

export interface Bet {
	id: string
	tokenID: number
	player: {
		id: Address
		name: string
	}
	market: {
		id: Address
		name: string
		closingTime: BigNumberish
	}
	results: readonly Bytes[]
	points: number
}

export interface GraphBet {
	id: string
	market: {
		id: string
	}
	tokenID: string
	reward: BigNumberish
}

export const BET_FIELDS = `
  fragment BetFields on Bet {
    id
    market {
      id
    }
    tokenID
    reward
  }
`

export type CurationStatus = 'Absent' | 'Registered' | 'RegistrationRequested' | 'ClearingRequested' | 'Error'

export interface CurateItem {
	id: string
	hash: string
	title: string
	timestamp: BigNumberish
	json: string
	data: string
	status: CurationStatus
}

export const CURATE_ITEM_FIELDS = `
  fragment CurateItemFields on CurateItem {
    id
    hash
    data
    json
    timestamp
    status
  }
`

export interface MarketFactory {
	id: string
	numOfBets: BigNumberish
	numOfMarkets: BigNumberish
	numOfPlayers: BigNumberish
	prizedClaimed: BigNumberish
	totalVolumeBets: BigNumberish
	totalVolumeFunding: BigNumberish
}

export const MARKET_FACTORY_FIELDS = `
  fragment MarketFactoryFields on MarketFactory {
    numOfBets
    numOfMarkets
    numOfPlayers
    prizedClaimed
    totalVolumeBets
    totalVolumeFunding
  }
`

export interface SVGAd {
	id: Address
	curateSVGAdItem: Pick<CurateSVGAdItem, 'id'> | null
	markets: Pick<Market, 'id'>[]
	bids: Pick<AdBid, 'id' | 'bidPerSecond' | 'market' | 'bidder' | 'balance' | 'startTimestamp' | 'currentHighest'>[]
	activeMarkets: Pick<Market, 'id'>[]
}

export const SVG_AD_FIELDS = `
  fragment SVGAdsFields on SVGAd {
    id
    curateSVGAdItem {id}
    markets {id}
    bids {
      id
      bidPerSecond
      market {
        id
        name
      }
      bidder
      balance
      startTimestamp
      currentHighest
    }
    activeMarkets {id}
  }
`

export interface AdBid {
	id: string
	market: Pick<Market, 'id' | 'name'>
	bidPerSecond: string
	bidder: string
	balance: string
	startTimestamp: string
	currentHighest: boolean
}

export interface CurateSVGAdItem {
	id: Address
	SVGAd: Pick<SVGAd, 'id'>
}
