import { useQuery } from "react-query";
import {apolloProdeQuery} from "../lib/apolloClient";
import {Tournament, TOURNAMENT_FIELDS} from "../graphql/subgraph";

const query = `
    ${TOURNAMENT_FIELDS}
    query TournamentsQuery {
      tournaments(first: 10, orderBy: closingTime, orderDirection: desc) {
        ...TournamentFields
      }
    }
`;

export const useTournaments = () => {
  return useQuery<Tournament[], Error>(
    ["useTournaments"],
    async () => {
      const response = await apolloProdeQuery<{ tournaments: Tournament[] }>(query);

      if (!response) throw new Error("No response from TheGraph");

      return response.data.tournaments;
    }
  );
};