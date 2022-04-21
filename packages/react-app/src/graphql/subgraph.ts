import { BigNumberish } from "@ethersproject/bignumber";

export interface Tournament {
  id: string
  name: string
  price: BigNumberish
  creationTime: string
  closingTime: string
  managementFee: BigNumberish
  manager: string
  pool: BigNumberish
  period: number
  players: Player[]
  bets: Bet[]
}

export const TOURNAMENT_FIELDS = `
    fragment TournamentFields on Tournament {
      id
      name
      price
      creationTime
      closingTime
      managementFee
      manager{id}
      pool
      period
    }
`;

export interface Answer {
  id: string
  answer: BigNumberish
  historyHash: string
  user: string
  bond: BigNumberish
  timestamp: string
  isCommitment: boolean
  match: Match
  tournament: Tournament
  isPendingArbitration: boolean
  arbitrationOccurred: boolean
}

export interface Match {
  id: string
  questionID: string
  nonce: BigNumberish
  tournament: Tournament
  answer: Answer
  openingTs: string
  finalizeTs: string
  timeout: string
  minBond: BigNumberish
  contentHash: string
  historyHash: string
}

export interface Player {
  id: string
  amountBeted: BigNumberish
  pricesReceived: BigNumberish
  tournaments: [Tournament]
  bets: [Bet]
}

export interface Bet {
  id: string
  player: Player
  tournament: Tournament
  tokenID: BigNumberish
  points: BigNumberish
  results: BigNumberish[]
  count: BigNumberish
  claim: Boolean
  reward: BigNumberish
}

export interface Manager {
  id: string
  tournaments: [Tournament]
  managementRewards: BigNumberish
}

export interface Funder {
  id: string
  amount: BigNumberish
  tournaments: [Tournament]
  messages: [string]
}

export const MATCH_FIELDS = `
  fragment MatchFields on Match {
    id
    questionID
    nonce
    tournament{id}
    answer{id, answer}
    openingTs
    finalizeTs
    timeout
    minBond
    contentHash
    historyHash
  }
`;

export const PLAYER_FIELDS = `
  fragment PlayerFields on Player {
    amountBeted
    pricesReceived
    tournaments{id}
    bets{id}
  }
`;

export const BET_FIELDS = `
  fragment BetFields on Bet {
    id
    player{id}
    tournament{id}
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
  openingTimestamp: string
  currentAnswer: string
  isPendingArbitration: boolean
  answerFinalizedTimestamp: string | null
  outcomes: Outcome[]
}

export const QUESTION_FIELDS = `
  fragment QuestionFields on Question {
    questionId
    qTitle
    openingTimestamp
    currentAnswer
    isPendingArbitration
    answerFinalizedTimestamp
    outcomes {
      id
      answer
    }
  }
`;