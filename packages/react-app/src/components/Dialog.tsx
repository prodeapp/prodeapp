import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import * as React from 'react';

interface DialogTitleProps {
	id: string;
	children?: React.ReactNode;
	onClose: () => void;
}

export interface DialogProps {
	open: boolean;
	children?: React.ReactNode;
	handleClose: () => void;
	title?: string;
	actions?: React.ReactNode;
}

const AppDialogTitle = (props: DialogTitleProps) => {
	const { children, onClose, ...other } = props;

	return (
		<DialogTitle sx={{ m: 0, p: 2 }} {...other}>
			{children}
			{onClose ? (
				<IconButton
					aria-label='close'
					onClick={onClose}
					sx={{
						position: 'absolute',
						right: 8,
						top: 8,
						color: theme => theme.palette.grey[500],
					}}
				>
					<CloseIcon />
				</IconButton>
			) : null}
		</DialogTitle>
	);
};

export default function AppDialog({
	handleClose,
	children,
	open,
	title,
	actions,
}: DialogProps) {
	const onClose = (event: object, reason: string) => {
		if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
			return;
		}

		handleClose();
	};

	return (
		<Dialog
			onClose={onClose}
			fullWidth={true}
			maxWidth='md'
			aria-labelledby='customized-dialog-title'
			open={open}
		>
			<AppDialogTitle id='customized-dialog-title' onClose={handleClose}>
				{title}
			</AppDialogTitle>
			<DialogContent>{children}</DialogContent>
			{actions}
		</Dialog>
	);
}
