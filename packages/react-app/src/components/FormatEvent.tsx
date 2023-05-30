import Box from '@mui/material/Box'
import { SxProps } from '@mui/system'

import { getTeamImage } from '@/lib/teams-images'
import { matchQuestion } from '@/lib/templates'

const teamSx = {
	width: 'calc(50% - 15px)',
}

const getCountryFromEvent = (title: string) => {
	if (title.includes('Premier League')) {
		return 'en'
	}

	if (title.includes('La Liga Santander')) {
		return 'es'
	}

	if (title.includes('F1') && title.includes('Grand Prix')) {
		return 'f1'
	}

	if (title.includes('FIFA World Cup')) {
		return 'fifa_wc'
	}

	if (title.includes('UEFA Champions League')) return 'uefa_champions'

	return 'ar'
}

export function FormatOutcome({
	name,
	country,
	title,
	imageAlign = 'left',
	xsColumn = false,
}: {
	name: string
	country?: string
	title?: string
	imageAlign?: 'left' | 'right'
	xsColumn?: boolean
}) {
	if (!country) {
		country = title ? getCountryFromEvent(title) : ''
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

	const image = getTeamImage(name, country)
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

	const country = getCountryFromEvent(title)

	return (
		<div style={{ display: 'flex', alignItems: 'center' }}>
			<div style={teamSx}>
				<FormatOutcome name={params.param1} country={country} imageAlign='right' />
			</div>
			<div style={{ width: '30px', textAlign: 'center' }}>vs</div>
			<div style={teamSx}>
				<FormatOutcome name={params.param2} country={country} />
			</div>
		</div>
	)
}
