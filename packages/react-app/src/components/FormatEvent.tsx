import Box from '@mui/material/Box'
import { SxProps } from '@mui/system'

import { getTeamImage } from '@/lib/teams-images'
import { matchQuestion } from '@/lib/templates'

const teamSx = {
	width: 'calc(50% - 15px)',
}

export const getEventCodeFromTitle = (title: string): string | undefined => {
	if (title.includes('Premier League')) {
		return 'footbal_england'
	}

	if (title.includes('La Liga Santander')) {
		return 'footbal_spain'
	}

	if (title.includes('Brasileiro')) {
		return 'footbal_brazil'
	}

	if (title.includes('F1') && title.includes('Grand Prix')) {
		return 'f1'
	}

	if (title.includes('FIFA World Cup')) {
		return 'fifa_wc'
	}

	if (title.includes('UEFA Champions League')) {
		return 'uefa_champions'
	}

	if (title.includes('Liga Profesional Argentina')) {
		return 'football_argentina'
	}
}

export function FormatOutcome({
	name,
	eventCode,
	title,
	imageAlign = 'left',
	xsColumn = false,
}: {
	name: string
	eventCode?: string
	title?: string
	imageAlign?: 'left' | 'right'
	xsColumn?: boolean
}) {
	if (!eventCode) {
		eventCode = title ? getEventCodeFromTitle(title) : ''
	}

	const style: SxProps = { display: 'flex', alignItems: 'center' }

	if (imageAlign === 'right') {
		style.justifyContent = 'end'
		style.textAlign = 'right'
	}

	if (xsColumn) {
		style.flexDirection = { xs: xsColumn ? 'column' : 'row', sm: 'row' }
		style.textAlign = { xs: 'center', sm: imageAlign === 'right' ? 'right' : 'left' }
	}

	const image = eventCode && getTeamImage(name, eventCode)
	return (
		<Box sx={style}>
			{image && imageAlign === 'left' && (
				<img src={image} alt={name} width={15} height={15} style={{ marginRight: '5px' }} />
			)}
			<div>{name}</div>
			{image && imageAlign === 'right' && (
				<img src={image} alt={name} width={15} height={15} style={{ marginLeft: '5px' }} />
			)}
		</Box>
	)
}

export function FormatEvent({ title }: { title: string }) {
	const params = matchQuestion(title)

	if (params === null || !params?.param1 || !params?.param2) {
		return <>{title}</>
	}

	const eventCode = getEventCodeFromTitle(title)

	return (
		<div style={{ display: 'flex', alignItems: 'center' }}>
			<div style={teamSx}>
				<FormatOutcome name={params.param1} eventCode={eventCode} imageAlign='right' />
			</div>
			<div style={{ width: '30px', textAlign: 'center' }}>vs</div>
			<div style={teamSx}>
				<FormatOutcome name={params.param2} eventCode={eventCode} />
			</div>
		</div>
	)
}
