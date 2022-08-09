import { BoxWrapper, BoxRow } from '../../components';
import { Bet } from '../../graphql/subgraph';
import {getAnswerText} from '../../lib/helpers';
import {BigNumber} from "@ethersproject/bignumber";
import { Trans, t } from '@lingui/macro';
import {FormatEvent, FormatOutcome} from "../FormatEvent";
import {usePhone} from "../../hooks/useResponsive";
import Box from '@mui/material/Box';

function getBetResult(eventResult: string, playerBet: string) {
  if (eventResult === "") {
    return 0
  }

  return playerBet === eventResult ? 1 : 2
}

const bigColumnSx = {
  width: {xs: '100%', md: '40%'},
  fontSize: {xs: '14px', md: '16px'},
  marginBottom: {xs: '10px', md: '0'},
  wordBreak: 'break-word',
}

const smallColumnsSx = {
  width: {xs: '33%', md: '20%'},
  fontSize: {xs: '13px', md: '16px'},
  display: 'inline-block',
  verticalAlign: 'top',
  wordBreak: 'break-word',
  textAlign: {xs: 'center', md: 'left'}
}

const mobileLabelSx = {
  opacity: 0.7,
  fontSize: '12px',
}

export default function BetDetails({bet}: {bet: Bet}) {
  const isPhone = usePhone();
  let events = [...bet.market.events];
  events.sort((a, b) => (a.openingTs > b.openingTs) ? 1 : ((b.openingTs > a.openingTs) ? -1 : 0))
  return <BoxWrapper>
    {!isPhone && <BoxRow>
      <div style={{ width: '40%'}}><Trans>Event</Trans></div>
      <div style={{ width: '20%'}}><Trans>Bet</Trans></div>
      <div style={{ width: '20%'}}><Trans>Result</Trans></div>
      <div style={{ width: '20%' }}><Trans>Points Earned</Trans></div>
    </BoxRow>}
    {events.map((event, i) => {
      const eventNonce = BigNumber.from(event.nonce).toNumber();
      const playerBet = getAnswerText(bet.results[eventNonce], event.outcomes || []);
      const eventResult = getAnswerText(event.answer, event.outcomes || [], '');
      const betResult = getBetResult(eventResult, playerBet);
      const backgroundColor = betResult === 0 ? undefined : (betResult === 1 ? 'rgba(0, 128, 0, 0.15)' : 'rgba(255, 0, 0, 0.15)')

      return <BoxRow key={i} style={{flexDirection: 'column', backgroundColor}}>
        <Box sx={{display: {md: 'flex'}, width: '100%', fontWeight: 'normal'}}>
          <Box sx={bigColumnSx}><FormatEvent title={event.title} /></Box>
          <Box sx={smallColumnsSx}>
            {isPhone && <div style={mobileLabelSx}><Trans>Bet</Trans></div>}
            <FormatOutcome name={playerBet} title={event.title} />
          </Box>
          <Box sx={smallColumnsSx}>
            {isPhone && <div style={mobileLabelSx}><Trans>Result</Trans></div>}
            <FormatOutcome name={eventResult || t`Unknown`} title={event.title} />
          </Box>
          <Box sx={smallColumnsSx}>
            {isPhone && <div style={mobileLabelSx}><Trans>Points Earned</Trans></div>}
            {betResult === 0 && <span><Trans>Waiting result</Trans></span>}
            {betResult === 1 && <span style={{color: 'green'}}>1</span>}
            {betResult === 2 && <span style={{color: 'red'}}>0</span>}
          </Box>
        </Box>
      </BoxRow>;
    })}
  </BoxWrapper>
}