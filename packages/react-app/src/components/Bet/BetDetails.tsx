import { t } from '@lingui/macro'
import { Trans } from '@lingui/macro'
import Box from '@mui/material/Box'

import { BoxRow, BoxWrapper } from '@/components'
import { FormatEvent, FormatOutcome } from '@/components/FormatEvent'
import { Bet } from '@/graphql/subgraph'
import { useEvents } from '@/hooks/useEvents'
import { usePhone } from '@/hooks/useResponsive'
import { getAnswerText, getOrderedEventsIndexes } from '@/lib/helpers'

function getBetResult(eventResult: string, playerBet: string) {
	if (eventResult === '') {
		return 0
	}

	return playerBet === eventResult ? 1 : 2
}

const bigColumnSx = (simpleMode: boolean) => ({
	width: { xs: '100%', md: simpleMode ? '80%' : '40%' },
	fontSize: { xs: '14px', md: '16px' },
	marginBottom: { xs: '10px', md: '0' },
	wordBreak: 'break-word',
})

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

export default function BetDetails({ bet, chainId }: { bet: Bet; chainId: number }) {
	const isPhone = usePhone()
	const { data: events = [] } = useEvents(bet.market.id, chainId)

	const orderedEventIndices = getOrderedEventsIndexes(events)

	return (
		<BoxWrapper>
			{!isPhone && (
				<BoxRow>
					<div style={{ width: '40%' }}>
						<Trans>Event</Trans>
					</div>
					<div style={{ width: '20%' }}>
						<Trans>Bet</Trans>
					</div>
					<div style={{ width: '20%' }}>
						<Trans>Result</Trans>
					</div>
					<div style={{ width: '20%' }}>
						<Trans>Points Earned</Trans>
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
							<Box sx={bigColumnSx(false)}>
								<FormatEvent title={event.title} />
							</Box>
							<Box sx={smallColumnsSx}>
								{isPhone && (
									<div style={mobileLabelSx}>
										<Trans>Bet</Trans>
									</div>
								)}
								<FormatOutcome name={playerBet} title={event.title} />
							</Box>
							<Box sx={smallColumnsSx}>
								{isPhone && (
									<div style={mobileLabelSx}>
										<Trans>Result</Trans>
									</div>
								)}
								<FormatOutcome name={eventResult || t`Unknown`} title={event.title} />
							</Box>
							<Box sx={smallColumnsSx}>
								{isPhone && (
									<div style={mobileLabelSx}>
										<Trans>Points Earned</Trans>
									</div>
								)}
								{betResult === 0 && (
									<span>
										<Trans>Waiting result</Trans>
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

export function SimpleBetDetails({ bet, chainId }: { bet: Bet; chainId: number }) {
	const isPhone = usePhone()
	const { data: events = [] } = useEvents(bet.market.id, chainId)

	const orderedEventIndices = getOrderedEventsIndexes(events)

	const smallColumn = {
		width: { xs: '100%', md: '20%' },
		fontSize: { xs: '13px', md: '16px' },
		display: { xs: 'flex', md: 'inline-block' },
		justifyContent: 'center',
		gap: '10px',
		verticalAlign: 'top',
		wordBreak: 'break-word',
		textAlign: { xs: 'center', md: 'left' },
	}

	return (
		<BoxWrapper>
			{!isPhone && (
				<BoxRow>
					<div style={{ width: '80%', textAlign: 'center' }}>
						<Trans>Event</Trans>
					</div>
					<div style={{ width: '20%' }}>
						<Trans>Your bet</Trans>
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

				return (
					<BoxRow key={i} style={{ flexDirection: 'column' }}>
						<Box
							sx={{
								display: { md: 'flex' },
								justifyContent: 'space-between',
								width: '100%',
								fontWeight: 'normal',
							}}
						>
							<Box sx={bigColumnSx(true)}>
								<FormatEvent title={event.title} />
							</Box>
							<Box sx={smallColumn}>
								{isPhone && (
									<div style={mobileLabelSx}>
										<Trans>Your bet</Trans>
									</div>
								)}
								<FormatOutcome name={playerBet} title={event.title} />
							</Box>
						</Box>
					</BoxRow>
				)
			})}
		</BoxWrapper>
	)
}
