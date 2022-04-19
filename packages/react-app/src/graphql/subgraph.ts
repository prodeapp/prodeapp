import { BigNumber } from "@ethersproject/bignumber";

export interface Tournament {
  id: string
  name: string
  price: BigNumber
  closingTime: BigNumber
  managementFee: BigNumber
  manager: string
  pool: BigNumber
  period: number
  players: Player[]
  bets: Bet[]
}

export const TOURNAMENT_FIELDS = `
    fragment TournamentFields on Tournament {
      id
      name
      price
      closingTime
      managementFee
      manager{id}
      pool
      period
    }
`;

export interface Answer {
  id: string
  answer: BigNumber
  historyHash: string
  user: string
  bond: BigNumber
  timestamp: BigNumber
  isCommitment: boolean
  match: Match
  tournament: Tournament
}

export interface Match {
  id: string
  questionID: string
  nonce: BigNumber
  tournament: Tournament
  answer: Answer
  openingTs: BigNumber
  finalizeTs: BigNumber
  timeout: BigNumber
  minBond: BigNumber
  contentHash: string
  historyHash: string
}

export interface Player {
  id: string
  amountBeted: BigNumber
  pricesReceived: BigNumber
  tournaments: [Tournament]
  bets: [Bet]
}

export interface Bet {
  id: string
  player: Player
  tournament: Tournament
  tokenID: BigNumber
  ranking: BigNumber
  points: BigNumber
  results: [BigNumber]
  count: BigNumber
  claim: Boolean
  reward: BigNumber
}

export interface Manager {
  id: string
  tournaments: [Tournament]
  managementRewards: BigNumber
}

export interface Funder {
  id: string
  amount: BigNumber
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
    ranking
    points
    results
    count
    claim
    reward
  }
`;

export interface Question {
  questionId: string
  qTitle: string
  outcomes: {
    id: string
    answer: string
  }[]
}

export const QUESTION_FIELDS = `
  fragment QuestionFields on Question {
    questionId
    qTitle
    outcomes {
      id
      answer
    }
  }
`;