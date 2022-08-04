import React, { useEffect, useState } from "react";
import { useRanking } from "../../hooks/useRanking";
import { BoxWrapper, BoxRow } from "../../components"
import Box from '@mui/material/Box';
import { Bet } from "../../graphql/subgraph";
import Alert from "@mui/material/Alert";
import { Trans, t } from "@lingui/macro";
import { Skeleton } from "@mui/material";
import { transOutcome } from "../../lib/helpers";
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { FormatEvent } from "../FormatEvent";


interface Stat {
    outcome: string
    amountBets: number
    percentage: number
    index: number
    title: string
}

function bets2Stats(bets: Bet[]): Stat[][] {
    // Initialize events stats
    let stats = bets[0].market.events.map((event) => {
        let stat = event.outcomes.map((outcome, index) => {
            return { outcome: transOutcome(outcome), amountBets: 0, percentage: 0, index: index, title: event.title, openingTs: event.openingTs}
        })
        stat.push({ outcome: t`Invalid`, amountBets: 0, percentage: 0, index: 257, title: event.title, openingTs: event.openingTs })
        return stat
    })
    // Add stats
    bets.forEach((bet) => {
        bet.results.forEach((result, i) => {
            if (parseInt(result) > 256) {
                const nResults = stats[i].length - 1;
                stats[i][nResults].amountBets = stats[i][nResults].amountBets + 1
            } else {
                stats[i][parseInt(result)].amountBets = stats[i][parseInt(result)].amountBets + 1
            }
        })
    })

    // Normalize data
    const nBets = bets.length
    stats.forEach((evntStat, i) => {
        evntStat.forEach((outcomeStat, o) => {
            stats[i][o].percentage = stats[i][o].amountBets / nBets * 100;
        })
    })

    // sort events by openingTs
    stats.sort((a, b) => (a[0].openingTs > b[0].openingTs) ? 1 : ((b[0].openingTs > a[0].openingTs) ? -1 : 0))

    // sort stats in each event by amount of bets
    stats.map((evntstat) => { return evntstat.sort((a, b) => (a.amountBets > b.amountBets) ? -1 : ((b.amountBets > a.amountBets) ? 1 : 0)) })

    // return stats
    if (bets[0].market.events[0].outcomes.length > 4) {
        // filter zero values for clarity in the graphs
        stats = stats.map((evntstat) => { return evntstat.filter((stat) => {return stat.amountBets !== 0 || stat.outcome.toLowerCase() === t`draw`}) })
    }
    // filter invalid if has 0 bets.
    return stats.map((evntstat) => { return evntstat.filter((stat) => {return stat.outcome.toLowerCase() === t`invalid` ?  stat.amountBets !== 0 : true}) })
    
}

function statsBarsVertical(events: Stat[]) {
    return (
        <BarChart data={events} layout='vertical'>
            <XAxis hide type="number" domain={[0, 110]} />
            <YAxis type="category" dataKey="outcome" width={150} />
            <Bar dataKey="percentage" stackId="single-stack" fill="#4267B3">
                <LabelList dataKey="percentage" position="right" formatter={(value: number) => { return value.toPrecision(3) + '%' }} />
            </Bar>
        </BarChart>
    );
}


function statsRows(stats: Stat[][]) {
    return stats.map((event, i) => {
        return (
        <Box key={i} sx={{ padding: '20px', borderBottom: '1px' }}>
            <BoxRow style={{ width: '90%', justifyContent: 'center' }}>
                <FormatEvent title={event[0].title} />
            </BoxRow>
            <BoxRow style={{ width: '90%', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" minHeight={event.length * 40}>
                    {statsBarsVertical(event)}
                </ResponsiveContainer>
            </BoxRow>
        </Box>)
    })
};


export function Stats({ marketId }: { marketId: string }) {
    const { isLoading, error, data: ranking } = useRanking(marketId);
    const [stats, setStats] = useState<Stat[][]>([]);

    useEffect(() => {
        if (ranking && ranking.length > 0) {
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