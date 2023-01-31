import { Trans } from '@lingui/react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import React, { useContext } from 'react'
import { Link as RouterLink } from 'react-router-dom'

import { GlobalContext } from '@/lib/GlobalContext'

import FiltersWrapper from './FiltersWrapper'

function AdsFilter() {
	const {
		adsFilters: { market, setMarket },
	} = useContext(GlobalContext)

	const onChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
		setMarket(evt.target.value)
	}

	return (
		<div>
			<FiltersWrapper>
				<div className='filter-columns'>
					<div>
						<div className='filter-label'>
							<Trans id='Market' />:
						</div>
						<Box
							sx={{
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							<TextField
								onChange={onChange}
								defaultValue={market}
								style={{ width: '100%' }}
								placeholder={`Market ID`}
								size='small'
							/>
						</Box>
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
						<Button component={RouterLink} to={`/ads/create`}>
							Submit ad
						</Button>
					</Box>
				</div>
			</FiltersWrapper>
		</div>
	)
}

export default AdsFilter
