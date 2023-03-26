import { Trans } from '@lingui/react'
import { Button, Container, Grid, Skeleton, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { BigNumberish } from 'ethers'
import { useState } from 'react'
import { useNetwork } from 'wagmi'

import { BoxRow, BoxWrapper } from '@/components'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useMarketFactory } from '@/hooks/useMarketFactory'
import { filterChainId } from '@/lib/config'
import { formatAmount, formatAmountDecimalPlaces, formatPlayerName } from '@/lib/helpers'

function formatName(params: { row: { id: string; name: string } }) {
	return formatPlayerName(params.row.name, params.row.id)
}

export default function Leaderboard() {
	const { chain } = useNetwork()
	const chainId = filterChainId(chain?.id)
	const { isLoading, data: leaderboard } = useLeaderboard()
	const { data: marketFactory } = useMarketFactory()
	const [sorting, setSorting] = useState<'numOfBets' | 'numOfMarkets' | 'pricesReceived' | 'amountBet'>(
		'pricesReceived'
	)
	const [direction, setDirection] = useState<'asc' | 'desc'>('desc')
	const [pageSize, setPageSize] = useState<number>(10)

	const columns = [
		{
			field: 'id',
			headerName: 'Player',
			type: 'string',
			flex: 2,
			valueGetter: formatName,
		},
		{ field: 'numOfBets', headerName: '# of Bets', type: 'number', flex: 1 },
		{
			field: 'numOfMarkets',
			headerName: '# of Markets',
			type: 'number',
			flex: 1,
		},
		{
			field: 'pricesReceived',
			headerName: 'Prices Received',
			type: 'number',
			flex: 1,
			valueFormatter: (params: { value: BigNumberish }) => {
				return formatAmountDecimalPlaces(params.value, chainId)
			},
		},
		{
			field: 'amountBet',
			headerName: 'Amount Beted',
			type: 'number',
			flex: 1,
			valueFormatter: (params: { value: BigNumberish }) => {
				return formatAmountDecimalPlaces(params.value, chainId)
			},
		},
	]

	return (
		<Container style={{ width: '100%', marginTop: '20px' }}>
			<Typography variant='h5'>
				<Trans id='Global Metrics:' />
			</Typography>
			<Grid container columnSpacing={2} rowSpacing={1} sx={{ marginTop: '30px', justifyContent: 'space-between' }}>
				<Grid item sm={12} md={3} sx={{ alignItems: 'center', justifyContent: 'center' }}>
					<BoxWrapper sx={{ padding: 2 }}>
						<Typography variant='h6'>
							<Trans id='Total Bets' />:{' '}
							{marketFactory ? formatAmount(marketFactory.totalVolumeBets, chainId) : <Skeleton />}
						</Typography>
					</BoxWrapper>
				</Grid>
				<Grid item sm={12} md={3} sx={{ alignItems: 'center', justifyContent: 'center' }}>
					<BoxWrapper sx={{ padding: 2 }}>
						<Typography variant='h6'>
							<Trans id='Total Bets' /> (#): {marketFactory ? marketFactory.numOfBets : <Skeleton />}
						</Typography>
					</BoxWrapper>
				</Grid>
				<Grid item sm={12} md={3} sx={{ alignItems: 'center', justifyContent: 'center' }}>
					<BoxWrapper sx={{ padding: 2 }}>
						<Typography variant='h6'>
							<Trans
								id='Total Players: {0}'
								values={{
									0: marketFactory ? marketFactory.numOfPlayers : <Skeleton />,
								}}
							/>
						</Typography>
					</BoxWrapper>
				</Grid>
				<Grid item sm={12} md={3} sx={{ alignItems: 'center', justifyContent: 'center' }}>
					<BoxWrapper sx={{ padding: 2 }}>
						<Typography variant='h6'>
							<Trans
								id='Total Markets: {0}'
								values={{
									0: marketFactory ? marketFactory.numOfMarkets : <Skeleton />,
								}}
							/>
						</Typography>
					</BoxWrapper>
				</Grid>
			</Grid>
			<Typography variant='h5'>Leaderboard</Typography>
			<BoxWrapper style={{ marginTop: '20px' }}>
				<BoxRow>
					<Grid container>
						<Grid item sm={8} sx={{ display: 'flex', justifyContent: 'left' }}>
							<div>
								<Button
									onClick={() => setSorting('numOfBets')}
									color={sorting === 'numOfBets' ? 'secondary' : 'primary'}
								>
									# of Bets
								</Button>
							</div>
							<div>
								<Button
									onClick={() => setSorting('numOfMarkets')}
									color={sorting === 'numOfMarkets' ? 'secondary' : 'primary'}
								>
									# of Markets
								</Button>
							</div>
							<div>
								<Button
									onClick={() => setSorting('pricesReceived')}
									color={sorting === 'pricesReceived' ? 'secondary' : 'primary'}
								>
									Prices Received
								</Button>
							</div>
							<div>
								<Button
									onClick={() => setSorting('amountBet')}
									color={sorting === 'amountBet' ? 'secondary' : 'primary'}
								>
									Amount Beted
								</Button>
							</div>
						</Grid>
						<Grid item sm={4} sx={{ display: 'flex', justifyContent: 'right' }}>
							<div>
								<Button onClick={() => setDirection('asc')} color={direction === 'asc' ? 'secondary' : 'primary'}>
									Ascending
								</Button>
							</div>
							<div>
								<Button onClick={() => setDirection('desc')} color={direction === 'desc' ? 'secondary' : 'primary'}>
									Descending
								</Button>
							</div>
						</Grid>
					</Grid>
				</BoxRow>
			</BoxWrapper>
			{
				<DataGrid
					rows={leaderboard ? leaderboard! : []}
					columns={columns}
					loading={isLoading}
					pageSize={pageSize}
					onPageSizeChange={newPageSize => setPageSize(newPageSize)}
					rowsPerPageOptions={[10, 50, 100]}
					pagination
					disableSelectionOnClick
					disableColumnFilter
					sortModel={[{ field: sorting, sort: direction }]}
					autoHeight={true}
				/>
			}
		</Container>
	)
}
