import { useQuery } from "react-query";
import apollo from "../lib/apolloClient";
import {Tournament, TOURNAMENT_FIELDS} from "../graphql/subgraph";

const query = `
    ${TOURNAMENT_FIELDS}
    query TournamentsQuery {
      tournaments(first: 10) {
        ...TournamentFields
      }
    }
`;

export const useTournaments = () => {
  return useQuery<Tournament[], Error>(
    ["useTournaments"],
    async () => {
      const response = await apollo<{ tournaments: Tournament[] }>(query);

      if (!response) throw new Error("No response from TheGraph");

      return response.data.tournaments;
    }
  );
};