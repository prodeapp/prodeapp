import { Box } from '@mui/material';
import { shortenAddress } from '@usedapp/core';
import { BoxRow } from '../components';
import { usePlayer } from '../hooks/usePlayer';
import { formatAmount } from '../lib/helpers';


export default function Profile() {
  // This ID should be the address of the connected wallet
  const id = "0x5fe87c1a3f42b49643f0a51703ff53f576be753e";
  const { data: player, error } = usePlayer(String(id));

  if (error) {
    return <div>Error...</div>
  }

  console.log(player)

  if (!player) {
    return <div>User not found</div>
  }

  return (
    <>
      <div style={{display: 'flex', marginBottom: '20px'}}>
        <div style={{width: '49%'}}>
          <Box style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{fontSize: '25px'}}>{player.id}</div>
          </Box>
        </div>
        <div style={{width: '49%', marginLeft: '2%'}}>
          <Box style={{height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <BoxRow>
              <div>Total Prize: {formatAmount(player.pricesReceived)}</div>
            </BoxRow>
          </Box>
        </div>

        <Box>
        {player.tournaments && player.tournaments.map((tournament, i) => {
          return <BoxRow key={i}>
            <div style={{width: '20%'}}>{i+1}</div>
            <div style={{width: '80%'}}>{shortenAddress(tournament.id)}</div>
          </BoxRow>
        })}
        </Box>

      </div>
    </>
  );
}
