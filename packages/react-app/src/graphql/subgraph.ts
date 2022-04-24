import { BigNumberish } from "@ethersproject/bignumber";

export interface Tournament {
  id: string
  name: string
  price: BigNumberish
  creationTime: string
  closingTime: string
  resultSubmissionPeriodStart: string
  submissionTimeout: string
  managementFee: string
  manager: string
  pool: BigNumberish
  players: Player[]
  bets: Bet[]
  matches: Match[]
}

export const TOURNAMENT_FIELDS = `
    fragment TournamentFields on Tournament {
      id
      name
      price
      creationTime
      closingTime
      resultSubmissionPeriodStart
      submissionTimeout
      managementFee
      manager{id}
      pool
    }
`;

export interface Answer {
  id: string
  answer: string
  historyHash: string
  user: string
  bond: BigNumberish
  timestamp: string
  isCommitment: boolean
  match: Match
  tournament: Tournament
}

export interface Match {
  id: string
  questionID: string
  nonce: BigNumberish
  tournament: Tournament
  answer: Answer | null
  openingTs: string
  finalizeTs: string
  timeout: string
  minBond: BigNumberish
  contentHash: string
  historyHash: string
  answerFinalizedTimestamp: string | null
  isPendingArbitration: boolean
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
    answerFinalizedTimestamp
    isPendingArbitration
  }
`;

export interface Player {
  id: string
  amountBeted: BigNumberish
  pricesReceived: BigNumberish
}

export interface Bet {
  id: string
  player: {
    id: string
  }
  tournament: {
    id: string
    name: string
    matches: {
      questionID: string
      answer: {
        answer: string
      } | null
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
    tournament {
      id,
      name,
      matches {
        questionID
        answer {
          answer
        }
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

export const PLAYER_FIELDS = `
  fragment PlayerFields on Player {
    bets{
      tournament{
        id
        name
        matches{
          answer{
            answer
          }
          id
        }
      }
      results
      tokenID
      points
      id
      reward
    }
    amountBeted
    pricesReceived
    numOfTournaments
    numOfBets
    id
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