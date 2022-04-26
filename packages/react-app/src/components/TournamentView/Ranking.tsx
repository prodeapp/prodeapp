import React from "react";
import {useRanking} from "../../hooks/useRanking";
import {shortenAddress} from "@usedapp/core";
import {Box, BoxRow} from "../../components"

export default function Ranking({tournamentId}: {tournamentId: string}) {
  const { data: ranking } = useRanking(tournamentId);

  return <Box>
    <BoxRow>
      <div style={{width: '20%'}}>#</div>
      <div style={{width: '40%'}}>Player</div>
      <div style={{width: '40%'}}>Points</div>
    </BoxRow>
    {ranking && ranking.map((rank, i) => {
      return <BoxRow key={i}>
        <div style={{width: '20%'}}>{i+1}</div>
        <div style={{width: '40%'}}>{shortenAddress(rank.player.id)}</div>
        <div style={{width: '40%'}}>{rank.points.toString()}</div>
      </BoxRow>
    })}
  </Box>
}
