import { ExpandMoreOutlined } from "@mui/icons-material"
import {Accordion, AccordionDetails, AccordionSummary, Alert, Button, Skeleton} from "@mui/material"
import { formatAmount } from "../../lib/helpers"
import BetDetails from "../Bet/BetDetails"
import { Trans } from "../Trans";
import {useBets} from "../../hooks/useBets";
import {Link as RouterLink} from "react-router-dom";
import React from "react";
import Link from "@mui/material/Link";

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
      <div>
          {bets.map(bet => {
              return (
                <Accordion id={bet.id} key={bet.id} sx={{mt: 4}}>
                    <AccordionSummary expandIcon={<ExpandMoreOutlined />} sx={{ alignContent: 'center' }}>
                        <div style={{width: '100%'}}>
                            <div style={{width: '100%', fontSize: '20px', marginBottom: '10px', fontWeight: '600'}}>{bet.market.name}</div>
                            <div style={{width: '100%', display: 'flex'}}>
                                <div style={{marginRight: '50px'}}><Trans>Points</Trans>: {bet.points}</div>
                                <div><Trans>Reward</Trans>: {formatAmount(bet.reward)}</div>
                            </div>
                        </div>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div style={{marginBottom: '20px'}}>
                            <Button component={RouterLink} to={`/markets/${bet.market.id}`}><Trans>Go to market</Trans></Button>
                            <Button component={Link} href={`https://epor.io/tokens/${bet.market.id}/${bet.tokenID}?network=xDai`} target="_blank" rel="noopener"><Trans>Trade NFT in Eporio</Trans></Button>
                        </div>

                        <BetDetails bet={bet} />
                    </AccordionDetails>
                </Accordion>
              )
          })}
      </div>
    )
}