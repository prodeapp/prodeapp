import {ExtraDataGroups} from "../components/Curate";
import {Event} from "../graphql/subgraph";
import {DoubleElimLeaderboardProps, Match} from "@g-loot/react-tournament-brackets/dist/src/types";

type EliminationConfig = {
  questions: Event[]
  config: ExtraDataGroups
}

export type ParsedEliminationConfig = {
  events: Event[]
  name: string
}

export const getEliminationConfig = (
  totalEvents: number,
  mainRoundNames: string[] = [],
  altRoundNames: string = 'Round of %',
  addThirdPlace: boolean = false
): ExtraDataGroups => {
  let n = 0;
  let accumEvents = Math.pow(2, n);
  let currentEvents = accumEvents;

  const config: ExtraDataGroups = {groups: [], rounds: 1};

  while(accumEvents <= totalEvents) {
    config.groups.unshift({size: currentEvents, name: mainRoundNames[n] || `${altRoundNames.replace('%', String(currentEvents * 2))}`});

    if (totalEvents === 2) {
      break;
    }

    if (addThirdPlace && (accumEvents + 1) === totalEvents) {
      // third place match
      config.groups.push({size: 1, name: 'Third place'})
    }

    n++;
    currentEvents = Math.pow(2, n);
    accumEvents += currentEvents;
  }

  return config;
}

export const getDoubleEliminationConfig = (events: Event[]): EliminationConfig[] => {
  const eventsCopy = [...events];

  const singleMatchFinal = eventsCopy.length % 2 === 0;
  const totalTeams = singleMatchFinal ? ((eventsCopy.length + 2) / 2) : ((eventsCopy.length + 1) / 2);

  if (Math.log2(totalTeams) % 1 !== 0) {
    throw new Error('Double elimination tournaments must have a quantity of teams power of 2.')
  }

  const brackets = [];

  // winners bracket
  brackets.push(
    {
      questions: eventsCopy.splice(0, totalTeams - 1),
      config: getEliminationConfig(totalTeams - 1, ['Winners Final', 'Winners Semifinals', 'Winners Quarterfinals'], 'Winners Round of %')
    }
  );

  // final match 1
  brackets.push(
    {questions: eventsCopy.splice(0, 1), config: getEliminationConfig(1, [], 'Final #1')}
  );

  if (!singleMatchFinal) {
    // final match 2
    brackets[1].questions.push(eventsCopy.splice(0, 1)[0]);
    const final2Config = getEliminationConfig(1, [], 'Final #2');
    brackets[1].config.groups.push(final2Config.groups[0]);
  }

  // losers bracket
  const totalLosersTeams = totalTeams / 2;
  const losersConfig = getEliminationConfig(totalLosersTeams, ['Losers Final #1', 'Losers Semifinals #1', 'Losers Quarterfinals #1'], 'Losers Round of % #1');

  const loserGroups: ExtraDataGroups['groups'] = [];

  losersConfig.groups.forEach((group) => {
    loserGroups.push(group);

    const tmp = Object.assign({}, group);
    tmp.name = tmp.name.replace('#1', '#2');
    loserGroups.push(tmp);
  });

  losersConfig.groups = loserGroups;

  brackets.push(
    {questions: eventsCopy, config: losersConfig}
  );

  return brackets;
}

export const getGSLConfig = (): ExtraDataGroups => {
  const groups = [
    {
      size: 2,
      name: 'Opening Matches'
    },
    {
      size: 1,
      name: 'Winner\'s Match'
    },
    {
      size: 1,
      name: 'Loser\'s Match'
    },
    {
      size: 1,
      name: 'Tiebreaker\'s Match'
    },
  ];

  return {
    groups,
    rounds: 1
  }
}

export const parseEliminationConfig = (events: Event[], config: ExtraDataGroups): ParsedEliminationConfig[] => {
  const sizeCount = config.groups.map((group) => Number(group.size)).reduce((partialSum, a) => partialSum + a, 0)

  if (sizeCount !== events.length) {
    throw new Error('The sum of group sizes must be equal to the amount of events.')
  }

  let t = 0;

  return config.groups.map((group, i) => {
    return {
      events: Array.from({length: group.size}, (_, i) => i + 1).map(j => {
        const n = t++;
        return events[n];
      }),
      name: group.name
    }
  })
}

function buildMatch(event: Event, nextMatchId: string | null = null, nextLoserMatchId?: string): Match {
  const hasTwoOutcomes = event.outcomes.length === 2;

  return {
    id: event.id,
    nextMatchId: nextMatchId as unknown as number,
    nextLooserMatchId: nextLoserMatchId as unknown as number,
    startTime: '',
    tournamentRoundText: '',
    state: 'SCHEDULED',
    participants: [
      {
        id: hasTwoOutcomes ? `${event.id}-1`: event.outcomes[0],
        resultText: '',
        isWinner: false,
        status: 'PLAYED',
        name: hasTwoOutcomes ? '' : event.outcomes[0],
      },
      {
        id: hasTwoOutcomes ? `${event.id}-2`: event.outcomes[1],
        resultText: '',
        isWinner: false,
        status: 'PLAYED',
        name: hasTwoOutcomes ? '' : event.outcomes[1],
      },
    ],
  }
}

export const getDoubleEliminationMatches = (events: Event[]): DoubleElimLeaderboardProps['matches'] => {
  const doubleEliminationConfig = getDoubleEliminationConfig(events).map(data => parseEliminationConfig(data.questions, data.config));

  const matches: DoubleElimLeaderboardProps['matches'] = {upper: [], lower: []};

  doubleEliminationConfig.forEach((bracketConfig, i) => {
    bracketConfig.forEach((roundConfig, j) => {
      const bracket = i === 2 ? 'lower' : 'upper';

      roundConfig.events.forEach((event, k) => {
        let nextMatchId = null;

        if (i === 0 && (j+1) === bracketConfig.length) {
          // the last element of the winners bracket must point to the final
          nextMatchId = doubleEliminationConfig[1][0].events[0].id;
        } else if (i === 2 && (j+1) === bracketConfig.length) {
          // the last element of the losers bracket must point to the final
          nextMatchId = doubleEliminationConfig[1][0].events[0].id;
        } else if (bracketConfig[j+1]) {
          // any other element must point to the corresponding match of the next round
          nextMatchId = bracketConfig[j+1].events[Math.floor(k/2)].id;
        }

        let nextLoserMatchId = undefined;

        if (i === 0) {
          // set nextLoserMatchId for each match of the winners bracket
          nextLoserMatchId = doubleEliminationConfig[2][j].events[Math.floor(k/2)].id;
        }

        const match = buildMatch(event, nextMatchId, nextLoserMatchId);

        matches[bracket].push(match);
      })

    })
  })

  return matches;
}

export const getGSLMatches = (events: Event[]): DoubleElimLeaderboardProps['matches'] => {
  const matches: DoubleElimLeaderboardProps['matches'] = {upper: [], lower: []};

  matches.upper.push(buildMatch(events[0], events[2].id, events[3].id));
  matches.upper.push(buildMatch(events[1], events[2].id, events[3].id));

  matches.upper.push(buildMatch(events[2], events[4].id));

  matches.lower.push(buildMatch(events[3], events[4].id));
  matches.lower.push(buildMatch(events[4]));

  return matches;
}


export const getSingleEliminationMatches = (events: Event[]): Match[] => {
  const bracketConfig = parseEliminationConfig(events, getEliminationConfig(events.length, ['Final', 'Semifinals', 'Quarterfinals'], '', true))

  const matches: Match[] = [];

  bracketConfig.forEach((roundConfig, j) => {
    roundConfig.events.forEach((event, k) => {
      let nextMatchId = null;

      if (bracketConfig[j+1]) {
        // every element must point to the corresponding match of the next round
        nextMatchId = bracketConfig[j+1].events[Math.floor(k/2)].id;
      }

      const match = buildMatch(event, nextMatchId);

      matches.push(match);
    })
  })

  return matches;
}