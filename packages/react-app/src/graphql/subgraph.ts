import { BigNumberish } from "@ethersproject/bignumber";

export interface Market {
  id: string
  hash: string
  name: string
  category: string
  price: BigNumberish
  numOfBets: string
  creationTime: string
  closingTime: string
  resultSubmissionPeriodStart: string
  submissionTimeout: string
  managementFee: string
  protocolFee: string
  manager: {
    id: string,
    managementRewards: BigNumberish
  }
  creator: string
  pool: string
  prizes: string[]
  curated: boolean
  numOfEvents: string
  numOfEventsWithAnswer: string
  hasPendingAnswers: boolean
}

export const MARKET_FIELDS = `
    fragment MarketFields on Market {
      id
      hash
      name
      category
      price
      numOfBets
      creationTime
      closingTime
      resultSubmissionPeriodStart
      submissionTimeout
      managementFee
      protocolFee
      manager{id, managementRewards}
      creator
      pool
      prizes
      curated
      hasPendingAnswers
      numOfEventsWithAnswer
      numOfEvents
    }
`;

export type Outcome = string

export interface Event {
  id: string
  nonce: BigNumberish
  arbitrator: string
  markets: [{
    id: string
  }]
  category: string
  title: string
  answer: string | null
  outcomes: Outcome[]
  openingTs: string
  answerFinalizedTimestamp: string | null
  isPendingArbitration: boolean
  timeout: string
  minBond: string
  lastBond: string
  bounty: string
  templateID: BigNumberish
}

export const EVENT_FIELDS = `
  fragment EventFields on Event {
    id
    nonce
    arbitrator
    markets{id}
    category
    title
    answer
    outcomes
    openingTs
    answerFinalizedTimestamp
    isPendingArbitration
    timeout
    minBond
    lastBond
    bounty
    templateID
  }
`;

export interface Player {
  id: string
  amountBet: BigNumberish
  pricesReceived: BigNumberish
  totalAttributions: BigNumberish
}


export const PLAYER_FIELDS = `
  fragment PlayerFields on Player {
    id
    amountBet
    pricesReceived
    totalAttributions
  }
`;

export interface Attribution {
  id: string
  market: {
    id: string,
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
`;

export interface MarketReferral {
  id: string
  market: {
    id: string,
    name: string
    resultSubmissionPeriodStart: string
  }
  totalAmount: BigNumberish
  claimed: boolean
  manager: string
  attributions: [{
    id: string
    attributor: {id: string}
    amount: BigNumberish
  }]
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
`;

export interface Leaderboard extends Player {
  numOfMarkets: string
  numOfBets: string
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
  ${PLAYER_FIELDS}
  fragment LeaderboardFields on Player {
    ...PlayerFields
    numOfMarkets
    numOfBets
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
`;

export interface Bet {
  id: string
  player: {
    id: string
  }
  market: {
    id: string
    name: string
    events: Pick<Event, 'id' | 'answer' | 'nonce' | 'title' | 'outcomes' |'openingTs' | 'templateID'>[]
  }
  tokenID: string
  points: BigNumberish
  results: string[]
  count: BigNumberish
  claim: Boolean
  reward: BigNumberish
}

export const BET_FIELDS = `
  fragment BetFields on Bet {
    id
    player {
      id
    }
    market {
      id,
      name,
      events {
        id
        answer
        nonce
        title
        outcomes
        openingTs
        templateID
      }
    }
    tokenID
    points
    results
    count
    claim
    reward
  }
`;

export type CurationStatus = "Absent" | "Registered" | "RegistrationRequested" | "ClearingRequested" | "Error"

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
`;