import React, { useEffect, useState } from "react";
import { useRanking } from "../../hooks/useRanking";
import { BoxWrapper, BoxRow } from "../../components"
import Box from '@mui/material/Box';
import { Bet } from "../../graphql/subgraph";
import Alert from "@mui/material/Alert";
import { Trans, t } from "@lingui/macro";
import { Skeleton } from "@mui/material";
import {transOutcome} from "../../lib/helpers";


interface Stat {
    outcome: string
    amountBets: number
    percentage: number
    index: number
}

function bets2Stats(bets: Bet[]): Stat[][] {
    // Initialize events stats
    let stats = bets[0].market.events.map((event) => {
        let stat = event.outcomes.map((outcome, index) => {
            return {outcome: transOutcome(outcome), amountBets: 0, percentage:0, index:index}
        })
        stat.push({outcome: t`Invalid`, amountBets: 0, percentage:0, index:257 })
        return stat
    })
    // Add stats
    bets.forEach((bet) => {bet.results.forEach((result, i)=> {
        if (parseInt(result)>256){
            const nResults = stats[i].length - 1;
            stats[i][nResults].amountBets = stats[i][nResults].amountBets + 1    
        } else {
            stats[i][parseInt(result)].amountBets = stats[i][parseInt(result)].amountBets + 1
        }
    })})

    // Normalize data
    const nBets = bets.length
    stats.forEach((evntStat, i) => {
        evntStat.forEach((outcomeStat, o) => {
            stats[i][o].percentage = stats[i][o].amountBets / nBets * 100;
        })
    })
    return stats
}

function statsRows(stats: Stat[][]) {
    return stats.map((event, i) => {
            return <Box sx={{padding: '20px', borderBottom: '1px'}}>
                <BoxRow key={i + '-0'}>
                    {event.map((value) => { return <div>{value.outcome}</div> })}
                </BoxRow>
                <BoxRow key={i + '-1'}>
                    {event.map((value) => { return <div>{value.percentage.toFixed(2) + ' %'}</div> })}
                </BoxRow>
            </Box>
        })
};

export function Stats({ marketId }: { marketId: string }) {
    const { isLoading, error, data: ranking } = useRanking(marketId);
    const [stats, setStats] = useState<Stat[][]>([]);

    useEffect(() => {
        if (ranking && ranking.length > 0){
            setStats(bets2Stats(ranking));
        }
    }, [ranking])

    if (isLoading) {
        return <Skeleton animation="wave" height={150} />
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>
    }

    return <>
        <BoxWrapper>
            {stats && stats.length === 0 && <Alert severity="info"><Trans>No bets found.</Trans></Alert>}
            {stats && stats.length > 0 && statsRows(stats)}
        </BoxWrapper>
    </>
}