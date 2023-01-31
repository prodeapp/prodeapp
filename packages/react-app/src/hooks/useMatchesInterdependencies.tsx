import { Event } from '@/graphql/subgraph'
import { getSingleEliminationMatches } from '@/lib/brackets'
import { DecodedCurateListFields, FORMAT_SINGLE_ELIMINATION } from '@/lib/curate'

import { useIndexedEvents } from './useEvents'

export type MatchesInterdependencies = Record<string, string[]>

export function useMatchesInterdependencies(
	events: Event[] | undefined,
	itemJson: DecodedCurateListFields['Details'] | null
): MatchesInterdependencies {
	const indexedEvents = useIndexedEvents(events)

	if (Object.keys(indexedEvents).length === 0 || itemJson === null) {
		return {}
	}

	const interdependenciesList = itemJson.formats.map((format: any) => {
		const interdependencies: MatchesInterdependencies = {}

		try {
			if (format.type === FORMAT_SINGLE_ELIMINATION) {
				const matches = getSingleEliminationMatches(format.questions.map((event: string) => indexedEvents[event]))
				const start = ~~(matches.length / 2 + 0.5)
				for (let i = start; i < matches.length; i++) {
					if (i === start * 2 - 1) {
						// third place match
						const previousMatchId = (i - start - 3) * 2
						interdependencies[matches[i].id] = [
							matches[previousMatchId].id as string,
							matches[previousMatchId + 1].id as string,
							matches[previousMatchId + 2].id as string,
							matches[previousMatchId + 3].id as string,
						]
					} else {
						const previousMatchId = (i - start) * 2
						interdependencies[matches[i].id] = [
							matches[previousMatchId].id as string,
							matches[previousMatchId + 1].id as string,
						]
					}
				}
				return interdependencies
			} else {
				return interdependencies
			}
		} catch {
			return interdependencies
		}
	})

	return interdependenciesList && Object.assign({}, ...interdependenciesList)
}

export function getInverseInterdependencies(
	matchesInterdependencies: MatchesInterdependencies
): MatchesInterdependencies {
	const interdependencies: MatchesInterdependencies = {}

	Object.keys(matchesInterdependencies).forEach(matchDependencyId => {
		matchesInterdependencies[matchDependencyId].forEach(matchId => {
			if (typeof interdependencies[matchId] === 'undefined') {
				interdependencies[matchId] = []
			}

			interdependencies[matchId].push(matchDependencyId)
		})
	})

	return interdependencies
}
