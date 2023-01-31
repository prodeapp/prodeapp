import React from 'react'

import { Event } from '@/graphql/subgraph'
import { useIndexedEvents } from '@/hooks/useEvents'
import { DecodedCurateListFields, FORMAT_GROUPS } from '@/lib/curate'

import Brackets from './Brackets'
import { Groups } from './Groups'

export function RenderTournament({
	events,
	itemJson,
}: {
	events: Event[]
	itemJson: DecodedCurateListFields['Details']
}) {
	const indexedEvents = useIndexedEvents(events)

	return (
		<>
			{Object.keys(indexedEvents).length > 0 && itemJson && (
				<div style={{ marginTop: '20px' }}>
					{itemJson.formats.map((format: any, i: number) => {
						if (format.type === FORMAT_GROUPS) {
							return (
								<Groups
									key={i}
									events={format.questions.map((event: string) => indexedEvents[event])}
									config={format.extraData}
								/>
							)
						}

						return (
							<Brackets
								key={i}
								events={format.questions.map((event: string) => indexedEvents[event])}
								type={format.type}
							/>
						)
					})}
				</div>
			)}
		</>
	)
}
