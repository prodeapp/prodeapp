import React from "react";
import { shortenAddress } from "@usedapp/core";
import Alert from "@mui/material/Alert";
import { Trans } from "@lingui/macro";
import { Grid, Skeleton } from "@mui/material";
import { formatAmount } from "../../lib/helpers";
import { BoxRow } from "..";
import { useAttributions } from "../../hooks/useAttributions";

export function Referrals({ provider }: { provider: string }) {
    const { data: referrals, error, isLoading } = useAttributions({ provider });

    if (error) {
        return <Alert severity="error">{error}</Alert>
    }

    if (isLoading) {
        return <Skeleton animation="wave" height={150} />
    }

    if (!referrals || referrals.length === 0) {
        return <Alert severity="info"><Trans>Start referring into markets and earn part of the fees that your referred pays.</Trans></Alert>
    }
    return (
        <Grid container columnSpacing={2} rowSpacing={1} sx={{ marginTop: '30px' }}>
            <Grid item sm={12} md={12}>
                <BoxRow>
                    <div style={{ width: '40%' }}><Trans>Referred</Trans></div>
                    <div style={{ width: '40%' }}><Trans>Market</Trans></div>
                    <div style={{ width: '20%' }}><Trans>Earn</Trans></div>
                </BoxRow>

                {referrals && referrals.map(refer => {
                    return (<BoxRow key={refer.id}>
                        <div style={{ width: '40%' }}>{shortenAddress(refer.attributor.id)}</div>
                        <div style={{ width: '40%' }}><a href={'/#/markets/' + refer.market.id}>{refer.market.name}</a></div>
                        <div style={{ width: '20%' }}>{formatAmount(refer.amount)}</div>
                    </BoxRow>
                    )
                })}
            </Grid>
        </Grid>
    )    
}