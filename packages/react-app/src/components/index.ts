import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'

export const FormError = styled('div')(({ theme }) => ({
	color: theme.palette.error.dark,
	marginTop: '5px',
	fontWeight: 'normal',
	fontSize: '14px',
}))

export const BoxWrapper = styled(Box)`
	font-size: 16px;
	font-weight: 700;
	margin-bottom: 20px;
`

export const BoxRow = styled('div')`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 15px;

	& + & {
		border-top: 1px solid #272727;
	}
`

export const FormRow = styled('div')`
	margin-bottom: 30px;
`

export const FormLabel = styled('div')(({ theme }) => ({
	color: theme.palette.secondary.contrastText,
	fontSize: '14px',
	fontWeight: 'bold',
	marginBottom: '5px',
}))

const TableRow = styled('div')(() => ({
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
	padding: '0 16px',
}))

export const TableHeader = styled(TableRow)(({ theme }) => ({
	background: theme.palette.secondary.dark,
	borderTop: `1px solid ${theme.palette.secondary.main}`,
	borderBottom: `1px solid ${theme.palette.secondary.main}`,
	fontWeight: 600,
	fontSize: '14px',
	minHeight: '40px',
}))

export const TableBody = styled(TableRow)(({ theme }) => ({
	fontSize: '16px',
	minHeight: '44px',
	borderBottom: `1px solid ${theme.palette.secondary.main}`,
	'&.padding-lg': {
		paddingTop: '16px',
		paddingBottom: '16px',
	},
}))

export const BoxLabelCell = styled('div')`
	margin-right: 10px;
	min-width: 30%;
`

export const BigAlert = styled(Alert, {
	shouldForwardProp: (prop) => prop !== 'ml',
})<{ ml?: number }>((/*{ theme, ml }*/) => ({
	fontSize: '19.2px',
	padding: '24px 28px',
	borderLeftWidth: '8px',
	borderLeftStyle: 'solid',
	borderRadius: 0,
	'.MuiAlertTitle-root': {
		fontSize: '27.65px',
		fontFamily: "'comfortaa', sans-serif",
		fontWeight: 'bold',
	},
	'.MuiAlert-message': {
		flexGrow: 1,
		padding: 0,
	},
	'.MuiAlert-icon': {
		padding: 0,
	},
}))
