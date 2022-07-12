import { BoxWrapper, BoxRow } from '../components';
import { Bet } from '../graphql/subgraph';
import {getAnswerText} from '../lib/helpers';
import {BigNumber} from "@ethersproject/bignumber";
import { Trans, t } from '@lingui/macro';

function getBetResult(eventResult: string, playerBet: string) {
  if (eventResult === "") {
    return 0
  }

  return playerBet === eventResult ? 1 : 2
}

export default function BetDetails({bet}: {bet: Bet}) {
  return <BoxWrapper>
    <BoxRow>
      <div style={{ width: '40%'}}><Trans>Your Bet</Trans></div>
      <div style={{ width: '40%'}}><Trans>Event Result</Trans></div>
      <div style={{ width: '20%' }}><Trans>Points Earned</Trans></div>
    </BoxRow>
    {bet.market.events.map((event, i) => {
      const eventNonce = BigNumber.from(event.nonce).toNumber();
      const playerBet = getAnswerText(bet.results[eventNonce], event.outcomes || []);
      const eventResult = getAnswerText(event.answer, event.outcomes || [], '');
      const betResult = getBetResult(eventResult, playerBet);
      const backgroundColor = betResult === 0 ? undefined : (betResult === 1 ? 'rgba(0, 128, 0, 0.15)' : 'rgba(255, 0, 0, 0.15)')

      return <BoxRow key={i} style={{flexDirection: 'column', backgroundColor}}>
        <div style={{ width: '100%', wordBreak: 'break-word' }}>{event.title}</div>
        <div style={{display: 'flex', width: '100%', marginTop: '15px', fontWeight: 'normal'}}>
          <div style={{ width: '40%', wordBreak: 'break-word' }}>{playerBet}</div>
          <div style={{ width: '40%', wordBreak: 'break-word' }}>{eventResult || t`Unknown`}</div>
          <div style={{ width: '20%' }}>
            {betResult === 0 && <span><Trans>Waiting result</Trans></span>}
            {betResult === 1 && <span style={{color: 'green'}}>1</span>}
            {betResult === 2 && <span style={{color: 'red'}}>0</span>}
          </div>
        </div>
      </BoxRow>;
    })}
  </BoxWrapper>
}