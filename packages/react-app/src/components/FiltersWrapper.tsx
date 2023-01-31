import Container from '@mui/material/Container'
import { styled } from '@mui/material/styles'

const FiltersWrapper = styled(Container)(({ theme }) => ({
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'space-between',
	padding: theme.spacing(2),

	[theme.breakpoints.down('md')]: {
		flexDirection: 'column',
	},

	'.filter-columns': {
		display: 'flex',

		[theme.breakpoints.down('md')]: {
			flexDirection: 'column',
			'&>div+div': {
				marginTop: '15px',
			},
		},

		'&>div': {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',

			[theme.breakpoints.up('md')]: {
				flexDirection: 'row',

				'&+div': {
					marginLeft: '13px',
				},
			},
		},

		'.filter-label': {
			fontWeight: 'bold',
			marginRight: '13px',

			[theme.breakpoints.down('md')]: {
				marginRight: 0,
				marginBottom: '5px',
			},
		},
	},

	'& > div': {
		[theme.breakpoints.down('md')]: {
			marginTop: theme.spacing(2),
		},
	},
}))

export default FiltersWrapper
