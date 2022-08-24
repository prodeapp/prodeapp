import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

export const FormError = styled('div')(({ theme }) => ({
  color: theme.palette.error.dark,
  marginTop: '5px',
  fontWeight: 'normal',
  fontSize: '14px',
}))

export const Header = styled('header')`
  align-items: center;
  color: white;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  min-height: 70px;
`;

export const Image = styled('img')`
  height: 40vmin;
  margin-bottom: 16px;
  pointer-events: none;
`;

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

const TableRow = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 16px',
}))

export const TableHeader = styled(TableRow)(({ theme }) => ({
  background: theme.palette.secondary.dark,
  borderTop: `1px solid ${theme.palette.black.dark}`,
  borderBottom: `1px solid ${theme.palette.black.dark}`,
  fontWeight: 600,
  fontSize: '14px',
  minHeight: '40px',
}))

export const TableBody = styled(TableRow)(({ theme }) => ({
  fontSize: '16px',
  minHeight: '44px',
  borderBottom: `1px solid ${theme.palette.black.dark}`,
  '&.padding-lg': {
    paddingTop: '16px',
    paddingBottom: '16px',
  },
}))

export const BoxLabelCell = styled('div')`
  margin-right: 10px;
  min-width: 30%;
`

export const AnswerFieldWrapper = styled('div')`
  & + & {
    margin-top: 10px;
  }
`

export const AnswerField = styled('div')`
  display: inline-flex;
  align-items: center;
`