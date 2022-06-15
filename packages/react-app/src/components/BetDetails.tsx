import { BoxWrapper, BoxRow } from '../components';
import { Bet } from '../graphql/subgraph';
import {getAnswerText} from '../lib/helpers';
import {useQuestions} from "../hooks/useQuestions";
import {BigNumber} from "@ethersproject/bignumber";

function getBetResult(eventResult: string, playerBet: string) {
  if (eventResult === "") {
    return 0
  }

  return playerBet === eventResult ? 1 : 2
}

export default function BetDetails({bet}: {bet: Bet}) {
  const { data: questions } = useQuestions(bet.market.id);
  return <BoxWrapper>
    <BoxRow>
      <div style={{ width: '40%'}}>Your Bet</div>
      <div style={{ width: '40%'}}>Event Result</div>
      <div style={{ width: '20%' }}>Points Earned</div>
    </BoxRow>
    {bet.market.events.map((event, i) => {
      const eventNonce = BigNumber.from(event.nonce).toNumber();
      const playerBet = getAnswerText(bet.results[eventNonce], questions?.[event.questionID].outcomes || []);
      const eventResult = getAnswerText(event.answer, questions?.[event.questionID].outcomes || [], '');
      const betResult = getBetResult(eventResult, playerBet);
      const backgroundColor = betResult === 0 ? undefined : (betResult === 1 ? 'rgba(0, 128, 0, 0.15)' : 'rgba(255, 0, 0, 0.15)')

      return <BoxRow key={i} style={{flexDirection: 'column', backgroundColor}}>
        <div style={{ width: '100%', wordBreak: 'break-word' }}>{questions?.[event.questionID].qTitle}</div>
        <div style={{display: 'flex', width: '100%', marginTop: '15px', fontWeight: 'normal'}}>
          <div style={{ width: '40%', wordBreak: 'break-word' }}>{playerBet}</div>
          <div style={{ width: '40%', wordBreak: 'break-word' }}>{eventResult || 'Unknown'}</div>
          <div style={{ width: '20%' }}>
            {betResult === 0 && <span>Waiting result</span>}
            {betResult === 1 && <span style={{color: 'green'}}>1</span>}
            {betResult === 2 && <span style={{color: 'red'}}>0</span>}
          </div>
        </div>
      </BoxRow>;
    })}
  </BoxWrapper>
}