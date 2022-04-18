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
}

export const TOURNAMENT_FIELDS = `
    fragment TournamentFields on Tournament {
      id
      name
      price
      closingTime
      managementFee
      manager
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
