import { useQuery } from "react-query";
import {apolloProdeQuery} from "../lib/apolloClient";
import {Tournament, TOURNAMENT_FIELDS} from "../graphql/subgraph";
import {buildQuery, QueryVariables} from "../lib/SubgraphQueryBuilder";

const query = `
    ${TOURNAMENT_FIELDS}
    query TournamentsQuery(#params#) {
      tournaments(where: {#where#}, first: 10, orderBy: closingTime, orderDirection: desc) {
        ...TournamentFields
      }
    }
`;

export type TournamentStatus = 'active'|'pending'|'closed'

interface Props {
  curated?: boolean
  status?: TournamentStatus
}

export const useTournaments = ({curated, status}: Props = {}) => {
  return useQuery<Tournament[], Error>(
    ["useTournaments", curated, status],
    async () => {
      const variables: QueryVariables = {curated};

      if (status !== undefined) {
        if (status === 'active') {
          variables['closingTime_gt'] = String(Math.round(Date.now() / 1000))
        } else if (status === 'pending') {
          variables['hasPendingAnswers'] = true
          variables['closingTime_lt'] = String(Math.round(Date.now() / 1000))
        } else if (status === 'closed') {
          variables['hasPendingAnswers'] = false
        }
      }

      const response = await apolloProdeQuery<{ tournaments: Tournament[] }>(buildQuery(query, variables), variables);

      if (!response) throw new Error("No response from TheGraph");

      return response.data.tournaments;
    }
  );
};