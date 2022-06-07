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
  manager: {
    id: string
  }
  pool: BigNumberish
  prizes: string[]
  curated: boolean
  numOfMatches: bigint
  numOfMatchesWithAnswer: bigint
  hasPendingAnswers: boolean
}

export const TOURNAMENT_FIELDS = `
    fragment TournamentFields on Tournament {
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
      numOfMatchesWithAnswer
      numOfMatches
    }
`;

export interface Match {
  id: string
  questionID: string
  nonce: BigNumberish
  tournament: {
    id: string
  }
  answer: string | null
  openingTs: string
  answerFinalizedTimestamp: string | null
  isPendingArbitration: boolean
}

export const MATCH_FIELDS = `
  fragment MatchFields on Match {
    id
    questionID
    nonce
    tournament{id}
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
  numOfTournaments: string
  numOfBets: string
  bets: {
    id: string
    results: string[]
    tokenID: BigNumberish
    points: BigNumberish
    reward: BigNumberish
    tournament: {
      id: string
      name: string
      matches: {
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
    numOfTournaments
    numOfBets
    bets{
      id
      results
      tokenID
      points
      reward
      tournament {
        id
        name
        matches {
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
  tournament: {
    id: string
    name: string
    matches: {
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
    tournament {
      id,
      name,
      matches {
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