import React from "react";
import Alert from "@mui/material/Alert";
import { Trans } from '@lingui/react';
import { Grid, Skeleton } from "@mui/material";
import {formatAmount, shortenAddress} from "../../lib/helpers";
import { BoxRow } from "..";
import { useMarkets } from "../../hooks/useMarkets";

export function Markets({ creatorId }: { creatorId: string }) {
    const { data: markets, error, isLoading } = useMarkets({creatorId: creatorId});

    if (error) {
        return <Alert severity="error">{error}</Alert>
    }

    if (isLoading) {
        return <Skeleton animation="wave" height={150} />
    }

    if (!markets || markets.length === 0) {
        return <Alert severity="info"><Trans id="Create a market and earn fees on each bet." /></Alert>
    }

    return (
        <Grid container columnSpacing={2} rowSpacing={1} sx={{ marginTop: '30px' }}>
            <Grid item sm={12} md={12}>
                <BoxRow>
                    <div style={{ width: '40%' }}><Trans id="Market" /></div>
                    <div style={{ width: '20%' }}><Trans id="Pool" /></div>
                    <div style={{ width: '20%' }}><Trans id="Rewards receiver" /></div>
                    <div style={{ width: '20%' }}><Trans id="Management Rewards Earned" /></div>
                </BoxRow>

                {markets && markets.map(market => {
                    return (<BoxRow key={market.id}>
                        <div style={{ width: '40%' }}><a href={'/#/markets/' + market.id}>{market.name}</a></div>
                        <div style={{ width: '20%' }}>{formatAmount(market.pool)}</div>
                        <div style={{ width: '20%' }}>{shortenAddress(market.manager.id)}</div>
                        <div style={{ width: '20%' }}>{formatAmount(market.manager.managementRewards)}</div>
                    </BoxRow>
                    )
                })}
            </Grid>
        </Grid>
    )    
}