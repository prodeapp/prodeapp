import { expect, test } from 'vitest'
import {Outcome, Event} from "../../graphql/subgraph";
import {getDoubleEliminationMatches} from "../brackets";

function getMockEvent(id: string, title: string, outcomes: Outcome[]): Event {
  return {
    id: id,
    markets: [{
      id: '1',
    }],
    title: title,
    answer: null,
    outcomes: outcomes,
    openingTs: '0',
    answerFinalizedTimestamp: null,
    isPendingArbitration: false,
    minBond: '0',
    lastBond: '0',
    bounty: '0',
    arbitrator: '',
    category: '',
    timeout: '0',
    templateID: '2',
  }
}

test('builds a 4 team double elimination bracket', () => {

  const events: Event[] = [
    getMockEvent('1', 'Who will win the match between Argentina and Brazil?', ['Argentina', 'Brazil']),
    getMockEvent('2', 'Who will win the match between Italy and Spain?', ['Italy', 'Spain']),
    getMockEvent('3', 'Who will win the match between Argentina and Italy?', ['Argentina', 'Italy']),
    getMockEvent('4', 'Who will win the match between Argentina and Brazil?', ['Argentina', 'Brazil']),
    getMockEvent('5', 'Who will win the match between Brazil and Spain?', ['Brazil', 'Spain']),
    getMockEvent('6', 'Who will win the match between Italy and Brazil?', ['Brazil', 'Italy']),
  ];

  const matches = {
    upper: [
      {
        id: '1',
        nextMatchId: '3',
        nextLooserMatchId: '5',
        startTime: '',
        tournamentRoundText: '',
        state: 'SCHEDULED',
        participants: [
          {
            id: 'Argentina',
            resultText: '',
            isWinner: false,
            status: 'PLAYED',
            name: 'Argentina',
          },
          {
            id: 'Brazil',
            resultText: '',
            isWinner: false,
            status: 'PLAYED',
            name: 'Brazil',
          },
        ],
      },
      {
        id: '2',
        nextMatchId: '3',
        nextLooserMatchId: '5',
        startTime: '',
        tournamentRoundText: '',
        state: 'SCHEDULED',
        participants: [
          {
            id: 'Italy',
            resultText: '',
            isWinner: false,
            status: 'PLAYED',
            name: 'Italy',
          },
          {
            id: 'Spain',
            resultText: '',
            isWinner: false,
            status: 'PLAYED',
            name: 'Spain',
          },
        ],
      },
      {
        id: '3',
        nextMatchId: '4',
        nextLooserMatchId: '6',
        startTime: '',
        tournamentRoundText: '',
        state: 'SCHEDULED',
        participants: [
          {
            id: 'Argentina',
            resultText: '',
            isWinner: false,
            status: 'PLAYED',
            name: 'Argentina',
          },
          {
            id: 'Italy',
            resultText: '',
            isWinner: false,
            status: 'PLAYED',
            name: 'Italy',
          },
        ],
      },
      {
        id: '4',
        nextMatchId: null,
        nextLooserMatchId: undefined,
        startTime: '',
        tournamentRoundText: '',
        state: 'SCHEDULED',
        participants: [
          {
            id: 'Argentina',
            resultText: '',
            isWinner: false,
            status: 'PLAYED',
            name: 'Argentina',
          },
          {
            id: 'Brazil',
            resultText: '',
            isWinner: false,
            status: 'PLAYED',
            name: 'Brazil',
          },
        ],
      },
    ],
    lower: [
      {
        id: '5',
        nextMatchId: '6',
        nextLooserMatchId: undefined,
        startTime: '',
        tournamentRoundText: '',
        state: 'SCHEDULED',
        participants: [
          {
            id: 'Brazil',
            resultText: '',
            isWinner: false,
            status: 'PLAYED',
            name: 'Brazil',
          },
          {
            id: 'Spain',
            resultText: '',
            isWinner: false,
            status: 'PLAYED',
            name: 'Spain',
          },
        ],
      },
      {
        id: '6',
        nextMatchId: '4',
        nextLooserMatchId: undefined,
        startTime: '',
        tournamentRoundText: '',
        state: 'SCHEDULED',
        participants: [
          {
            id: 'Brazil',
            resultText: '',
            isWinner: false,
            status: 'PLAYED',
            name: 'Brazil',
          },
          {
            id: 'Italy',
            resultText: '',
            isWinner: false,
            status: 'PLAYED',
            name: 'Italy',
          },
        ],
      },
    ],
  }

  expect(getDoubleEliminationMatches(events)).toEqual(matches);
});