import { Button, Container, Grid, Typography } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { BigNumberish } from 'ethers';
import { useState } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { formatAmount } from '../lib/helpers';
import { shortenAddress } from "@usedapp/core";
import { BoxWrapper, BoxRow } from '../components';


export default function Leaderboard() {
  const { isLoading, data: leaderboard } = useLeaderboard();
  const [sorting, setSorting] = useState<'numOfBets' | 'numOfTournaments' | 'pricesReceived' | 'amountBet'>('pricesReceived');
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc');

  const columns = [
    {
      field: 'id', headerName: 'Player', type: 'string', flex: 2, valueFormatter: (params: { value: string; }) => {
        return shortenAddress(params.value);
      }
    },
    { field: 'numOfBets', headerName: '# of Bets', type: 'number', flex: 1 },
    { field: 'numOfTournaments', headerName: '# of Tournaments', type: 'number', flex: 1 },
    {
      field: 'pricesReceived', headerName: 'Prices Received', type: 'string', flex: 1, valueFormatter: (params: { value: BigNumberish; }) => {
        return formatAmount(params.value);
      }
    },
    {
      field: 'amountBet', headerName: 'Amount Beted', type: 'string', flex: 1, valueFormatter: (params: { value: BigNumberish; }) => {
        return formatAmount(params.value);
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
              <div><Button onClick={() => setSorting('numOfTournaments')} color={sorting === 'numOfTournaments' ? 'secondary' : 'primary'}># of Tournaments</Button></div>
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
        pageSize={10}
        rowsPerPageOptions={[10, 50, 100]}
        style={{ height: '90%' }}
        disableSelectionOnClick
        disableColumnFilter
        autoPageSize
        sortModel= {[{ field: sorting, sort: direction }]}
      />}
    </Container>

  )
}
