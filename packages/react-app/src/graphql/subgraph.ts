import {BigNumber} from "@ethersproject/bignumber";

export interface Tournament {
  id: BigNumber
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
