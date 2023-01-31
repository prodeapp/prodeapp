import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

export function usePhone() {
	const theme = useTheme();
	return useMediaQuery(theme.breakpoints.down('md'));
}
