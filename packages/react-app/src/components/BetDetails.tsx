import { BoxWrapper, BoxRow } from '../components';
import { Bet } from '../graphql/subgraph';
import {getAnswerText} from '../lib/helpers';
import {useQuestions} from "../hooks/useQuestions";
import {BigNumber} from "@ethersproject/bignumber";

export default function BetDetails({bet}: {bet: Bet}) {
  const { data: questions } = useQuestions(bet.tournament.id);
  return <BoxWrapper>
    <BoxRow>
      <div style={{ width: '40%'}}>Your Bet</div>
      <div style={{ width: '40%'}}>Match Result</div>
      <div style={{ width: '20%' }}>Points Earned</div>
    </BoxRow>
    {bet.tournament.matches.map((match, i) => {
      const matchNonce = BigNumber.from(match.nonce).toNumber();
      const betResult = getAnswerText(bet.results[matchNonce], questions?.[match.questionID].outcomes || []);
      const matchResult = getAnswerText(match.answer, questions?.[match.questionID].outcomes || [], "Unknown");

      return <BoxRow key={i} style={{flexDirection: 'column'}}>
        <div style={{ width: '100%', wordBreak: 'break-word' }}>{questions?.[match.questionID].qTitle}</div>
        <div style={{display: 'flex', width: '100%', marginTop: '15px', fontWeight: 'normal'}}>
          <div style={{ width: '40%', wordBreak: 'break-word' }}>{betResult}</div>
          <div style={{ width: '40%', wordBreak: 'break-word' }}>{matchResult}</div>
          {/* TODO: If the points earned change with the tournament? */}
          <div style={{ width: '20%' }}>{betResult === matchResult ? "+1" : matchResult === "Unknown" ? "Waiting result": "0"}</div>
        </div>
      </BoxRow>;
    })}
  </BoxWrapper>
}