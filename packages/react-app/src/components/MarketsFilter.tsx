import { Trans } from '@lingui/react'
import Box from '@mui/material/Box'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Grid from '@mui/material/Grid'
import { styled } from '@mui/material/styles'
import Switch from '@mui/material/Switch'
import React, { useContext, useState } from 'react'

import { ReactComponent as DropdownArrow } from '@/assets/icons/dropdown-down.svg'
import { MarketStatus } from '@/hooks/useMarkets'
import { GlobalContext } from '@/lib/GlobalContext'
import { getCategoryText, getFlattenedCategories } from '@/lib/helpers'

import FiltersWrapper from './FiltersWrapper'
import { Radio } from './Radio'

const FilterSection = styled('div')(({ theme }) => ({
	background: theme.palette.secondary.main,
	padding: '15px 0',

	'&>div': {
		maxWidth: '600px',
		margin: '0 auto',
	},
}))

const UnderlineButton = styled('div', {
	shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ theme, selected }) => {
	const activeBorder = {
		content: '""',
		borderBottom: `2px solid ${theme.palette.primary.main}`,
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: '-5px',
	}

	return {
		fontSize: '16px',
		margin: '0 13px',
		cursor: 'pointer',
		position: 'relative',
		...(selected
			? {
					color: theme.palette.primary.main,
					fontWeight: 700,
			  }
			: {}),
		'&:after': {
			...(selected ? activeBorder : {}),
		},
		'&:hover:after': activeBorder,
	}
})

type FilterDropdownProps = React.HTMLAttributes<HTMLDivElement> & {
	isOpen: boolean
}

const FilterDropdownStyled = styled('div')(({ theme }) => ({
	position: 'relative',
	cursor: 'pointer',
	svg: {
		fill: theme.palette.primary.main,
	},
	'&.open svg': {
		fill: theme.palette.black.dark,
		transform: 'rotate(180deg)',
	},
}))

function FilterDropdown(props: FilterDropdownProps) {
	const { isOpen, children, ...rest } = props

	return (
		<FilterDropdownStyled {...rest} className={isOpen ? 'open' : ''}>
			<span>
				{children} <DropdownArrow style={{ marginLeft: '6px' }} />
			</span>
		</FilterDropdownStyled>
	)
}

function MarketsFilter() {
	const [activeSection, setActiveSection] = useState<'category' | ''>('')

	const { marketFilters } = useContext(GlobalContext)

	const { curated, setCurated, status, setStatus, category, setCategory } = marketFilters

	const changeStatus = (newStatus: MarketStatus) => {
		setStatus(newStatus)
	}

	return (
		<div>
			<FiltersWrapper>
				<div className='filter-columns'>
					<div>
						<div className='filter-label'>
							<Trans id='Status' />:
						</div>
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<div>
								<UnderlineButton onClick={() => changeStatus('active')} selected={status === 'active'}>
									<Trans id='Betting' />
								</UnderlineButton>
							</div>
							<div>
								<UnderlineButton onClick={() => changeStatus('pending')} selected={status === 'pending'}>
									<Trans id='Playing' />
								</UnderlineButton>
							</div>
							<div>
								<UnderlineButton onClick={() => changeStatus('closed')} selected={status === 'closed'}>
									<Trans id='Closed' />
								</UnderlineButton>
							</div>
						</Box>
					</div>
					<div>
						<div className='filter-label'>
							<Trans id='Category' />:
						</div>
						<FilterDropdown
							isOpen={activeSection === 'category'}
							onClick={() => setActiveSection(activeSection === 'category' ? '' : 'category')}
						>
							{category === 'All' ? 'All' : getCategoryText(category)}
						</FilterDropdown>
					</div>
				</div>
				<div>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<FormGroup>
							<FormControlLabel
								sx={{ m: 0 }}
								control={<Switch checked={curated} onClick={() => setCurated(!curated)} />}
								label={
									<span style={{ fontSize: '14px' }}>
										<Trans id='Only verified markets' />
									</span>
								}
							/>
						</FormGroup>
					</Box>
				</div>
			</FiltersWrapper>
			{activeSection === 'category' && (
				<FilterSection>
					<Grid container spacing={0}>
						<Grid item xs={6} sm={3}>
							<Radio active={category === 'All'} onClick={() => setCategory('All')}>
								<Trans id='All' />
							</Radio>
						</Grid>
						{getFlattenedCategories().map((cat) => (
							<Grid item xs={6} sm={3} key={cat.id}>
								<Radio active={category === cat.id} onClick={() => setCategory(cat.id)}>
									{cat.text}
								</Radio>
							</Grid>
						))}
					</Grid>
				</FilterSection>
			)}
		</div>
	)
}

export default MarketsFilter
