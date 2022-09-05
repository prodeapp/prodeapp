import { Button, Container, Grid, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { BigNumberish } from 'ethers';
import { useState } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { formatAmountDecimalPlaces } from '../lib/helpers';
import { shortenAddress } from "@usedapp/core";
import { BoxWrapper, BoxRow } from '../components';


export default function Leaderboard() {
  const { isLoading, data: leaderboard } = useLeaderboard();
  const [sorting, setSorting] = useState<'numOfBets' | 'numOfMarkets' | 'pricesReceived' | 'amountBet'>('pricesReceived');
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState<number>(10);

  const columns = [
    {
      field: 'id', headerName: 'Player', type: 'string', flex: 2, valueFormatter: (params: { value: string; }) => {
        return shortenAddress(params.value);
      }
    },
    { field: 'numOfBets', headerName: '# of Bets', type: 'number', flex: 1 },
    { field: 'numOfMarkets', headerName: '# of Markets', type: 'number', flex: 1 },
    {
      field: 'pricesReceived', headerName: 'Prices Received', type: 'number', flex: 1, valueFormatter: (params: { value: BigNumberish; }) => {
        return formatAmountDecimalPlaces(params.value);
      }
    },
    {
      field: 'amountBet', headerName: 'Amount Beted', type: 'number', flex: 1, valueFormatter: (params: { value: BigNumberish; }) => {
        return formatAmountDecimalPlaces(params.value);
      }
    },
  ];

  // TODO: use relative height
  return (
    <Container style={{ height: '500px', width: '100%', marginTop: '20px' }}>

      <Typography variant="h5">Leaderboard</Typography>
      <BoxWrapper style={{ marginTop: '20px' }}>
        <BoxRow>
          <Grid container>
            <Grid item sm={8} sx={{ display: 'flex', justifyContent: 'left' }}>
              <div><Button onClick={() => setSorting('numOfBets')} color={sorting === 'numOfBets' ? 'secondary' : 'primary'}># of Bets</Button></div>
              <div><Button onClick={() => setSorting('numOfMarkets')} color={sorting === 'numOfMarkets' ? 'secondary' : 'primary'}># of Markets</Button></div>
              <div><Button onClick={() => setSorting('pricesReceived')} color={sorting === 'pricesReceived' ? 'secondary' : 'primary'}>Prices Received</Button></div>
              <div><Button onClick={() => setSorting('amountBet')} color={sorting === 'amountBet' ? 'secondary' : 'primary'}>Amount Beted</Button></div>
            </Grid>
            <Grid item sm={4} sx={{ display: 'flex', justifyContent: 'right' }}>
              <div><Button onClick={() => setDirection('asc')} color={direction === 'asc' ? 'secondary' : 'primary'}>Ascending</Button></div>
              <div><Button onClick={() => setDirection('desc')} color={direction === 'desc' ? 'secondary' : 'primary'}>Descending</Button></div>
            </Grid>
          </Grid>
        </BoxRow>
      </BoxWrapper>
      {leaderboard && <DataGrid
        rows={leaderboard}
        columns={columns}
        loading={isLoading}
        pageSize={pageSize}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        rowsPerPageOptions={[10, 50, 100]}
        pagination
        disableSelectionOnClick
        disableColumnFilter
        sortModel= {[{ field: sorting, sort: direction }]}
      />}
    </Container>

  )
}
