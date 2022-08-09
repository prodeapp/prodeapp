import React from "react";
import Alert from "@mui/material/Alert";
import { Trans, t } from "@lingui/macro";
import { Accordion, AccordionDetails, AccordionSummary, Button, CircularProgress, Grid, Skeleton, Typography, useTheme } from "@mui/material";
import { formatAmount } from "../../lib/helpers";
import { BoxRow } from "..";
import { useMarketReferrals } from "../../hooks/useMarketReferrals";
import { MarketReferral } from "../../graphql/subgraph";
import { ExpandMoreOutlined } from "@mui/icons-material";
import { shortenAddress, useContractFunction } from "@usedapp/core";
import { Contract } from "@ethersproject/contracts";
import { Manager__factory } from "../../typechain";

function ClaimAction({marketReferral}: {marketReferral: MarketReferral}) {
    const theme = useTheme();

    const { send, state } = useContractFunction(new Contract(marketReferral.manager, Manager__factory.createInterface()), 'claimReferralReward');

    const handleClaimOnClick = async (manager: string) => {
        await send(manager);
    };

    if (marketReferral.claimed || state.status === 'Success') {
        return <>{t`Already Claimed` + '!'}</>;
    }

    if (marketReferral.market.resultSubmissionPeriodStart === '0') {
        return <div><Trans>Waiting for prize distribution</Trans></div>;
    }

    if (state.status === 'Mining') {
        return <CircularProgress />;
    }

    return <div style={{display:'flex'}}>
        <Button onClick={() => handleClaimOnClick(marketReferral.manager)}><Trans>Claim</Trans></Button>
        {state.status === 'Exception'? <Typography sx={{color: theme.palette.error.main, marginLeft: '10px'}}><Trans>Error</Trans></Typography> : null}
    </div>
}

function ReferralDetail({ marketReferral }: { marketReferral: MarketReferral }) {
    return <Accordion>
        <AccordionSummary
            expandIcon={<ExpandMoreOutlined />}
            aria-controls="panel1a-content"
        >
            <div style={{ width: '60%' }}><a href={'/#/marketsReferrals/' + marketReferral.market.id}>{marketReferral.market.name}</a></div>
            <div style={{ width: '15%' }}>{formatAmount(marketReferral.totalAmount)}</div>
            <div style={{ width: '25%' }}>
                <ClaimAction marketReferral={marketReferral} />
            </div>
        </AccordionSummary>
        <AccordionDetails>
            {marketReferral.attributions.map((attribution) => {
                return <BoxRow key={attribution.id}>
                    <div style={{ width: '80%' }}>{shortenAddress(attribution.attributor.id)}</div>
                    <div style={{ width: '20%' }}>{formatAmount(attribution.amount)}</div>
                </BoxRow>
            })
           }
        </AccordionDetails>
    </Accordion>
}


export function Referrals({ provider }: { provider: string }) {
    const { data: marketsReferrals, error, isLoading } = useMarketReferrals({ provider });

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
        <Grid container columnSpacing={2} rowSpacing={1} sx={{ marginTop: '30px', marginBottom: '30px'}}>
            <Grid item sm={12} md={12}>
                <BoxRow key='header'>
                    <div style={{ width: '60%' }}><Trans>Market</Trans></div>
                    <div style={{ width: '15%' }}><Trans>Earn</Trans></div>
                    <div style={{ width: '20%' }}><Trans>Claim</Trans></div>
                    <div style={{ width: '5%' }}></div>
                </BoxRow>

                {marketsReferrals && marketsReferrals.map(mr => {
                    return <ReferralDetail marketReferral={mr} key={mr.id}/>
                })}
            </Grid>
        </Grid>
    )
}