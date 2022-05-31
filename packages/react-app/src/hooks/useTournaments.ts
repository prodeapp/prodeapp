import { useQuery } from "react-query";
import {apolloProdeQuery} from "../lib/apolloClient";
import {Tournament, TOURNAMENT_FIELDS} from "../graphql/subgraph";
import {buildQuery} from "../lib/SubgraphQueryBuilder";

const query = `
    ${TOURNAMENT_FIELDS}
    query TournamentsQuery(#params#) {
      tournaments(where: {#where#}, first: 10, orderBy: closingTime, orderDirection: desc) {
        ...TournamentFields
      }
    }
`;

interface Props {
  curated?: boolean
}

export const useTournaments = ({curated}: Props = {}) => {
  return useQuery<Tournament[], Error>(
    ["useTournaments", curated],
    async () => {
      const variables = {curated};
      const response = await apolloProdeQuery<{ tournaments: Tournament[] }>(buildQuery(query, variables), variables);

      if (!response) throw new Error("No response from TheGraph");

      return response.data.tournaments;
    }
  );
};