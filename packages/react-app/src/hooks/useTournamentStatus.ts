import { useQuery } from "react-query";
import compareAsc from "date-fns/compareAsc";
import fromUnixTime from "date-fns/fromUnixTime";
import {useTournament} from "./useTournament";
import {isFinalized} from "../lib/helpers";
import {useMatches} from "./useMatches";

type TournamentStatus = 'ACCEPTING_BETS' | 'WAITING_ANSWERS' | 'WAITING_AVAILABITILY_OF_RESULTS' | 'WAITING_REGISTER_POINTS' | 'FINALIZED';

export const useTournamentStatus = (tournamentId: string) => {
  const {data: tournament} = useTournament(tournamentId)
  const {data: matches} = useMatches(tournamentId)

  return useQuery<TournamentStatus | '', Error>(
    ["useTournamentStatus", tournamentId],
    async () => {
      if (!tournament || !matches) {
        return '';
      }

      if (compareAsc(fromUnixTime(Number(tournament.closingTime)), new Date()) === 1) {
        // closingTime > now
        return 'ACCEPTING_BETS';
      }

      const hasPendingAnswers = matches.filter(q => !isFinalized(q)).length > 0

      if (hasPendingAnswers) {
        return 'WAITING_ANSWERS'
      }

      if (
        /* now() > closingTime && */
        tournament.resultSubmissionPeriodStart === '0'
      ) {
        return 'WAITING_AVAILABITILY_OF_RESULTS';
      }

      if (
        /* tournament.resultSubmissionPeriodStart !== '0' && */
        compareAsc(fromUnixTime(Number(tournament.resultSubmissionPeriodStart) + Number(tournament.submissionTimeout)), new Date()) === 1
      ) {
        // resultSubmissionPeriodStart > now
        return 'WAITING_REGISTER_POINTS'
      }

      // available to claim rewards
      return 'FINALIZED';
    },
    {
      enabled: !!tournament && !!matches
    }
  );
};