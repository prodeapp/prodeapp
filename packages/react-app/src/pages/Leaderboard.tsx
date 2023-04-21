import { Trans } from '@lingui/macro'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { DataGrid, GridColDef, GridSortModel } from '@mui/x-data-grid'
import { BigNumber, BigNumberish } from 'ethers'
import { useState } from 'react'
import { useNetwork } from 'wagmi'

import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useMarketFactory } from '@/hooks/useMarketFactory'
import { filterChainId } from '@/lib/config'
import { DecimalBigNumber } from '@/lib/DecimalBigNumber'
import { formatAmount, formatAmountDecimalPlaces, formatPlayerName } from '@/lib/helpers'

function formatName(params: { row: { id: string; name: string } }) {
	return formatPlayerName(params.row.name, params.row.id)
}

function getPnL(params: { row: { amountBet: BigNumberish; pricesReceived: BigNumberish } }) {
	const beted = new DecimalBigNumber(BigNumber.from(params.row.amountBet), 18)
	const received = new DecimalBigNumber(BigNumber.from(params.row.pricesReceived), 18)
	const number = Number(received) - Number(beted)
	return `${number.toFixed(2)}`
}

function getROI(params: { row: { amountBet: BigNumberish; pricesReceived: BigNumberish } }) {
	const beted = Number(new DecimalBigNumber(BigNumber.from(params.row.amountBet), 18))
	const received = Number(new DecimalBigNumber(BigNumber.from(params.row.pricesReceived), 18))
	const roi = received === 0 ? 0 : beted === 0 ? Number('inf') : ((received - beted) / beted) * 100
	return roi.toFixed(1)
}

export default function Leaderboard() {
	const { chain } = useNetwork()
	const chainId = filterChainId(chain?.id)
	const { isLoading, data: leaderboard } = useLeaderboard()
	const { data: marketFactory } = useMarketFactory()
	const [pageSize, setPageSize] = useState<number>(10)
	const [sortModel, setSortModel] = useState<GridSortModel>([
		{
			field: 'pricesReceived',
			sort: 'desc',
		},
	])

	const columns: GridColDef[] = [
		{
			field: 'id',
			headerName: 'Player',
			type: 'string',
			flex: 2,
			valueGetter: formatName,
			sortable: false,
		},
		{ field: 'numOfBets', headerName: '# of Bets', type: 'number', flex: 1 },
		{
			field: 'numOfMarkets',
			headerName: '# of Markets',
			type: 'number',
			flex: 1,
			sortable: true,
		},
		{
			field: 'pricesReceived',
			headerName: 'Prices Received',
			type: 'number',
			flex: 1,
			valueFormatter: (params: { value: BigNumberish }) => {
				return formatAmountDecimalPlaces(params.value, chainId)
			},
			sortable: true,
		},
		{
			field: 'amountBet',
			headerName: 'Amount Beted',
			type: 'number',
			flex: 1,
			valueFormatter: (params: { value: BigNumberish }) => {
				return formatAmountDecimalPlaces(params.value, chainId)
			},
			sortable: true,
		},
		{
			field: 'pnl',
			headerName: 'PnL',
			type: 'number',
			flex: 1,
			valueGetter: getPnL,
			sortable: true,
		},
		{
			field: 'roi',
			headerName: 'ROI %',
			type: 'number',
			flex: 1,
			valueGetter: getROI,
			sortable: true,
		},
	]

	return (
		<Container style={{ width: '100%', marginTop: '20px' }}>
			<Typography variant='h5'>
				<Trans>Global Metrics</Trans>
			</Typography>
			<Grid container columnSpacing={2} rowSpacing={1} sx={{ marginY: '30px', textAlign: 'center' }}>
				<Grid item sm={12} md={3}>
					<Typography variant='h6'>
						<Trans>Total Bets</Trans>:{' '}
						{marketFactory ? formatAmount(marketFactory.totalVolumeBets, chainId) : <Skeleton />}
					</Typography>
				</Grid>
				<Grid item sm={12} md={3}>
					<Typography variant='h6'>
						<Trans>Total Bets</Trans> (#): {marketFactory ? marketFactory.numOfBets : <Skeleton />}
					</Typography>
				</Grid>
				<Grid item sm={12} md={3}>
					<Typography variant='h6'>
						<Trans
							id='Total Players: {0}'
							values={{
								0: marketFactory ? marketFactory.numOfPlayers : <Skeleton />,
							}}
						/>
					</Typography>
				</Grid>
				<Grid item sm={12} md={3}>
					<Typography variant='h6'>
						<Trans
							id='Total Markets: {0}'
							values={{
								0: marketFactory ? marketFactory.numOfMarkets : <Skeleton />,
							}}
						/>
					</Typography>
				</Grid>
			</Grid>

			<Typography variant='h5' sx={{ marginBottom: '30px' }}>
				Leaderboard
			</Typography>

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
				onSortModelChange={model => setSortModel(model)}
				sortModel={sortModel}
				sortingOrder={['desc', 'asc']}
				autoHeight={true}
			/>
		</Container>
	)
}
