import React from "react";
import { useRanking } from "../../hooks/useRanking";
import { BoxWrapper, BoxRow } from "../../components"
import Box from '@mui/material/Box';
import { Bet } from "../../graphql/subgraph";
import Alert from "@mui/material/Alert";
import { Trans, t } from "@lingui/macro";
import { Skeleton, useTheme } from "@mui/material";
import { transOutcome, getAnswerText } from "../../lib/helpers";
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
            return { outcome: transOutcome(outcome), amountBets: 0, percentage: 0, index: index, title: event.title, openingTs: event.openingTs }
        })
        stat.push({ outcome: t`Invalid result`, amountBets: 0, percentage: 0, index: -1, title: event.title, openingTs: event.openingTs })
        return stat
    })
    if (stats.length === 0) return [];
    // Add stats
    bets.forEach((bet) => {
        bet.results.forEach((result, i) => {
            let evnt = bet.market.events[i]
            let betText = getAnswerText(result, evnt.outcomes, evnt.templateID)
            let betStatIndex = stats[i].findIndex((evnt) => evnt.outcome===betText);
            if (betStatIndex === -1) {
                // this bet it's a combination of outcomes, so need to be initialized
                betStatIndex = stats[i].length
                stats[i][betStatIndex] = { outcome: getAnswerText(result, evnt.outcomes, evnt.templateID), amountBets: 0, percentage: 0, index: stats[i].length, title: evnt.title, openingTs: evnt.openingTs }
            }
            stats[i][betStatIndex].amountBets = stats[i][betStatIndex].amountBets + 1
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
        stats = stats.map((evntstat) => { return evntstat.filter((stat) => { return stat.amountBets !== 0 || stat.outcome.toLowerCase() === t`draw` }) })
    }
    // filter invalid if has 0 bets.
    return stats.map((evntstat) => { return evntstat.filter((stat) => { return stat.outcome === t`Invalid result` ? stat.amountBets !== 0 : true }) })
}

export function Stats({ marketId }: { marketId: string }) {
    const { isLoading, error, data: ranking } = useRanking(marketId);
    const theme = useTheme();

    if (isLoading) {
        return <Skeleton animation="wave" height={150} />
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>
    }

    const stats = ranking && ranking.length > 0 ? bets2Stats(ranking) : []

    return <>
        <BoxWrapper>
            {stats.length === 0 && <Alert severity="info"><Trans>No bets found.</Trans></Alert>}
            {stats.length > 0 && stats.map((event, i) => {
                return (
                    <Box key={i} sx={{ padding: '20px', borderBottom: '1px' }}>
                        <BoxRow style={{ width: '90%', justifyContent: 'center' }}>
                            <FormatEvent title={event[0].title} />
                        </BoxRow>
                        <BoxRow style={{ width: '90%', justifyContent: 'center' }}>
                            <ResponsiveContainer width="100%" minHeight={event.length * 40}>
                                <BarChart data={event} layout='vertical'>
                                    <XAxis hide type="number" domain={[0, 110]} />
                                    <YAxis type="category" dataKey="outcome" width={150} />
                                    <Bar dataKey="percentage" stackId="single-stack" fill={theme.palette.primary.main}>
                                        <LabelList dataKey="percentage" position="right" formatter={(value: number) => { return value.toPrecision(3) + '%' }} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </BoxRow>
                    </Box>)
            })}
        </BoxWrapper>
    </>
}