import { Box, BoxRow } from '../components';
import { Bet } from '../graphql/subgraph';
import {getAnswerText} from '../lib/helpers';
import {useQuestions} from "../hooks/useQuestions";

export default function BetDetails({bet}: {bet: Bet}) {
  const { data: questions } = useQuestions(bet.tournament.id);
  return <Box>
    <BoxRow>
      <div style={{ width: '40%'}}>Your Bet</div>
      <div style={{ width: '40%'}}>Match Result</div>
      <div style={{ width: '20%' }}>Points Earned</div>
    </BoxRow>
    {bet.tournament.matches.map((match, i) => {
      let betResult = getAnswerText(bet.results[i], questions?.[match.questionID].outcomes || []);
      let matchResult = getAnswerText(match.answer, questions?.[match.questionID].outcomes || [], "Unknown");

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
  </Box>
}