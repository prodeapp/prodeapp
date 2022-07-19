import { ExpandMoreOutlined } from "@mui/icons-material"
import { Accordion, AccordionDetails, AccordionSummary, Alert, Grid, Skeleton } from "@mui/material"
import { BoxRow } from ".."
import { formatAmount } from "../../lib/helpers"
import BetDetails from "../BetDetails"
import { Trans } from '@lingui/macro';
import {useBets} from "../../hooks/useBets";

export function Bets({playerId}: {playerId: string}) {
    const { data: bets, error, isLoading } = useBets(playerId);
    
    if (error) {
        return <Alert severity="error">{error}</Alert>
    }

    if (isLoading) {
        return <Skeleton animation="wave" height={150}/>
    }

    if (!bets || bets.length === 0) {
        return <Alert severity="error"><Trans>No bets found.</Trans></Alert>
    }

    return (
        <Grid container columnSpacing={2} rowSpacing={1} sx={{ marginTop: '30px' }}>
            <Grid item sm={12} md={12}>
                <BoxRow>
                    <div style={{ width: '20%' }}><Trans>Token ID</Trans></div>
                    <div style={{ width: '40%' }}><Trans>Market</Trans></div>
                    <div style={{ width: '20%' }}><Trans>Points</Trans></div>
                    <div style={{ width: '20%' }}><Trans>Reward</Trans></div>
                </BoxRow>

                {bets && bets.map(bet => {
                    return (
                        <Accordion id={bet.id} key={bet.id}>
                            <AccordionSummary expandIcon={<ExpandMoreOutlined />} sx={{ alignContent: 'center' }}>
                                <div style={{ width: '20%' }}>{bet.tokenID}</div>
                                <div style={{ width: '40%' }}><a href={'/#/markets/' + bet.market.id}>{bet.market.name}</a></div>
                                <div style={{ width: '20%' }}>{bet.points}</div>
                                <div style={{ width: '20%' }}>{formatAmount(bet.reward)}</div>
                            </AccordionSummary>
                            <AccordionDetails>
                                <BetDetails bet={bet} />
                            </AccordionDetails>
                        </Accordion>
                    )
                })}
            </Grid>
        </Grid>
    )
}