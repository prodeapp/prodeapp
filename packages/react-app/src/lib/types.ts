import {BigNumber} from "@ethersproject/bignumber";

export interface Tournament {
  id: BigNumber
  name: string
  owner: string
  price: BigNumber
  closingTime: BigNumber
  submissionTimeout: BigNumber
  managementFee: BigNumber
  manager: string
  participants: BigNumber
  totalPrize: BigNumber
}

export interface Ranking {
  tournamentId: BigNumber
  player: string
  points: BigNumber
}

export interface Match {
  tournamentId: BigNumber
  question: string
  result: string
}

/**
 * Assertion function
 */
export function assert(value: unknown, message: string | Error): asserts value {
  if (!value) throw message instanceof Error ? message : new Error(message);
}