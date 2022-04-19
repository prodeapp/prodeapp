import { BigNumberish } from "@ethersproject/bignumber";

export interface Tournament {
  id: string
  name: string
  price: BigNumberish
  closingTime: BigNumberish
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
  timestamp: BigNumberish
  isCommitment: boolean
  match: Match
  tournament: Tournament
}

export interface Match {
  id: string
  questionID: string
  nonce: BigNumberish
  tournament: Tournament
  answer: Answer
  openingTs: BigNumberish
  finalizeTs: BigNumberish
  timeout: BigNumberish
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
  ranking: BigNumberish
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