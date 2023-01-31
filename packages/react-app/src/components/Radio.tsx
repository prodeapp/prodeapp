import { styled } from '@mui/material/styles';
import React from 'react';

type RadioProps = React.HTMLAttributes<HTMLDivElement> & {
	active: boolean;
};

export const RadioStyled = styled('div')(({ theme }) => ({
	span: {
		display: 'block',
		padding: '10px 23px 10px 50px',
		fontSize: '16px',
		cursor: 'pointer',
		position: 'relative',
		'&:before': {
			content: '""',
			width: '16px',
			height: '16px',
			display: 'block',
			border: `1px solid ${theme.palette.primary.main}`,
			borderRadius: '50%',
			position: 'absolute',
			left: '23px',
			top: '14px',
		},
		'&.active': {
			color: theme.palette.primary.main,
			fontWeight: 700,
			'&:before': {
				background: theme.palette.primary.main,
			},
		},
	},
}));

export function Radio(props: RadioProps) {
	const { active, children, ...rest } = props;
	return (
		<RadioStyled {...rest}>
			<span className={active ? 'active' : ''}>{children}</span>
		</RadioStyled>
	);
}
