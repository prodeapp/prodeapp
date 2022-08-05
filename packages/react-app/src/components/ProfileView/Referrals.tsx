import React from "react";
import Alert from "@mui/material/Alert";
import { Trans, t } from "@lingui/macro";
import { Button, Grid, Skeleton } from "@mui/material";
import { formatAmount } from "../../lib/helpers";
import { BoxRow } from "..";
import { useMarketReferrals } from "../../hooks/useMarketReferrals";



export function Referrals({ provider }: { provider: string }) {
    const { data: marketsReferrals, error, isLoading } = useMarketReferrals({ provider });

    const handleClaimOnClick = (manager: string) => {
        // TODO: claim the referrals rewards from the manager contract
    };

    if (error) {
        return <Alert severity="error">{error}</Alert>
    }

    if (isLoading) {
        return <Skeleton animation="wave" height={150} />
    }

    if (!marketsReferrals || marketsReferrals.length === 0) {
        return <Alert severity="info"><Trans>Start referring into markets and earn part of the fees that your referred pays.</Trans></Alert>
    }
    return (
        <Grid container columnSpacing={2} rowSpacing={1} sx={{ marg7nTop: '30px' }}>
            <Grid item sm={12} md={12}>
                <BoxRow>
                    <div style={{ width: '40%' }}><Trans>Market</Trans></div>
                    <div style={{ width: '20%' }}><Trans>Earn</Trans></div>
                    <div style={{ width: '20%' }}><Trans>Claim</Trans></div>
                </BoxRow>

                {marketsReferrals && marketsReferrals.map(mr => {
                    return (<BoxRow>
                        <div style={{ width: '40%' }}><a href={'/#/marketsReferrals/' + mr.market.id}>{mr.market.name}</a></div>
                        <div style={{ width: '20%' }}>{formatAmount(mr.totalAmount)}</div>
                        <div style={{ width: '20%' }}>{mr.claimed ? t`Already Claimed`+'!' : <Button onClick={() => handleClaimOnClick(mr.manager)}><Trans>Claim</Trans></Button>}</div>
                    </BoxRow>
                    )
                })}
            </Grid>
        </Grid>
    )
}