import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react'
import Box from '@mui/material/Box'

import { BoxRow, BoxWrapper } from '@/components'
import { FormatEvent, FormatOutcome } from '@/components/FormatEvent'
import { Bet } from '@/graphql/subgraph'
import { usePhone } from '@/hooks/useResponsive'
import { getAnswerText } from '@/lib/helpers'

function getBetResult(eventResult: string, playerBet: string) {
	if (eventResult === '') {
		return 0
	}

	return playerBet === eventResult ? 1 : 2
}

const bigColumnSx = {
	width: { xs: '100%', md: '40%' },
	fontSize: { xs: '14px', md: '16px' },
	marginBottom: { xs: '10px', md: '0' },
	wordBreak: 'break-word',
}

const smallColumnsSx = {
	width: { xs: '33%', md: '20%' },
	fontSize: { xs: '13px', md: '16px' },
	display: 'inline-block',
	verticalAlign: 'top',
	wordBreak: 'break-word',
	textAlign: { xs: 'center', md: 'left' },
}

const mobileLabelSx = {
	opacity: 0.7,
	fontSize: '12px',
}

export default function BetDetails({ bet }: { bet: Bet }) {
	const isPhone = usePhone()
	const events = [...bet.market.events]
	events.sort((a, b) => (a.openingTs > b.openingTs ? 1 : b.openingTs > a.openingTs ? -1 : 0))
	const orderedEventIndices = Array.from(Array(events.length).keys()).sort((a, b) =>
		events[a].id < events[b].id ? -1 : 1
	)

	return (
		<BoxWrapper>
			{!isPhone && (
				<BoxRow>
					<div style={{ width: '40%' }}>
						<Trans id='Event' />
					</div>
					<div style={{ width: '20%' }}>
						<Trans id='Bet' />
					</div>
					<div style={{ width: '20%' }}>
						<Trans id='Result' />
					</div>
					<div style={{ width: '20%' }}>
						<Trans id='Points Earned' />
					</div>
				</BoxRow>
			)}
			{events.map((event, i) => {
				const eventNonce = orderedEventIndices.indexOf(i)
				const playerBet = getAnswerText(
					bet.results[eventNonce],
					event.outcomes || [],
					event.templateID,
					'Invalid value'
				)
				const eventResult = getAnswerText(event.answer, event.outcomes || [], event.templateID, '')
				const betResult = getBetResult(eventResult, playerBet)
				const backgroundColor =
					betResult === 0 ? undefined : betResult === 1 ? 'rgba(0, 128, 0, 0.15)' : 'rgba(255, 0, 0, 0.15)'

				return (
					<BoxRow key={i} style={{ flexDirection: 'column', backgroundColor }}>
						<Box
							sx={{
								display: { md: 'flex' },
								width: '100%',
								fontWeight: 'normal',
							}}
						>
							<Box sx={bigColumnSx}>
								<FormatEvent title={event.title} />
							</Box>
							<Box sx={smallColumnsSx}>
								{isPhone && (
									<div style={mobileLabelSx}>
										<Trans id='Bet' />
									</div>
								)}
								<FormatOutcome name={playerBet} title={event.title} />
							</Box>
							<Box sx={smallColumnsSx}>
								{isPhone && (
									<div style={mobileLabelSx}>
										<Trans id='Result' />
									</div>
								)}
								<FormatOutcome name={eventResult || i18n._('Unknown')} title={event.title} />
							</Box>
							<Box sx={smallColumnsSx}>
								{isPhone && (
									<div style={mobileLabelSx}>
										<Trans id='Points Earned' />
									</div>
								)}
								{betResult === 0 && (
									<span>
										<Trans id='Waiting result' />
									</span>
								)}
								{betResult === 1 && <span style={{ color: 'green' }}>1</span>}
								{betResult === 2 && <span style={{ color: 'red' }}>0</span>}
							</Box>
						</Box>
					</BoxRow>
				)
			})}
		</BoxWrapper>
	)
}
