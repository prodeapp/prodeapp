import { BigNumberish } from "@ethersproject/bignumber";

export interface Market {
  id: string
  name: string
  price: BigNumberish
  creationTime: string
  closingTime: string
  resultSubmissionPeriodStart: string
  submissionTimeout: string
  managementFee: string
  manager: {
    id: string
  }
  pool: BigNumberish
  prizes: string[]
  curated: boolean
  numOfEvents: bigint
  numOfEventsWithAnswer: bigint
  hasPendingAnswers: boolean
}

export const MARKET_FIELDS = `
    fragment MarketFields on Market {
      id
      hash
      name
      price
      creationTime
      closingTime
      resultSubmissionPeriodStart
      submissionTimeout
      managementFee
      manager{id}
      pool
      prizes
      curated
      hasPendingAnswers
      numOfEventsWithAnswer
      numOfEvents
    }
`;

export interface Event {
  id: string
  questionID: string
  nonce: BigNumberish
  market: {
    id: string
  }
  answer: string | null
  openingTs: string
  answerFinalizedTimestamp: string | null
  isPendingArbitration: boolean
}

export const EVENT_FIELDS = `
  fragment EventFields on Event {
    id
    questionID
    nonce
    market{id}
    answer
    openingTs
    answerFinalizedTimestamp
    isPendingArbitration
  }
`;

export interface Player {
  id: string
  amountBet: BigNumberish
  pricesReceived: BigNumberish
}

export const PLAYER_FIELDS = `
  fragment PlayerFields on Player {
    id
    amountBet
    pricesReceived
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
    events: {
      questionID: string
      answer: string | null
      nonce: string
    }[]
  }
  tokenID: BigNumberish
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
        questionID
        answer
        nonce
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

export interface Outcome {
  id: string
  answer: string
}

export interface Question {
  questionId: string
  qTitle: string
  outcomes: Outcome[]
  minBond: string
  lastBond: string
  bounty: string
}

export const QUESTION_FIELDS = `
  fragment QuestionFields on Question {
    questionId
    qTitle
    outcomes {
      id
      answer
    }
    minBond
    lastBond
    bounty
  }
`;

export interface CurateItem {
  id: string
  hash: string
  title: string
  timestamp: BigNumberish
  json: string
  data: string
}

export const CURATE_ITEM_FIELDS = `
  fragment CurateItemFields on CurateItem {
    id
    hash
    data
    json
    timestamp
  }
`;