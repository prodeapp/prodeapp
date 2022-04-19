import { useQuery } from "react-query";
import {apolloProdeQuery} from "../lib/apolloClient";
import {Tournament, TOURNAMENT_FIELDS} from "../graphql/subgraph";

const query = `
    ${TOURNAMENT_FIELDS}
    query TournamentQuery($tournamentId: String) {
        tournament(id: $tournamentId) {
            ...TournamentFields
        }
    }
`;

export const useTournament = (tournamentId: string) => {
  return useQuery<Tournament, Error>(
    ["useTournament", tournamentId],
    async () => {
      const response = await apolloProdeQuery<{ tournament: Tournament }>(query, {tournamentId});

      if (!response) throw new Error("No response from TheGraph");

      return response.data.tournament;
    }
  );
};