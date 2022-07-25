import {Leaderboard, LEADERBOARD_FIELDS} from "../graphql/subgraph";
import {apolloProdeQuery} from "../lib/apolloClient";
import { useQuery } from "@tanstack/react-query";

const query = `
    ${LEADERBOARD_FIELDS}
    query LeaderboardQuery {
        players(first: 100, orderBy: numOfBets, orderDirection: desc) {
            ...LeaderboardFields
        }
    }
`;

export const useLeaderboard = () => {
  return useQuery<Leaderboard[], Error>(
    ["useLeaderboard"],
    async () => {
      const response = await apolloProdeQuery<{ players: Leaderboard[] }>(query);

      if (!response) throw new Error("No response from TheGraph");

      return response.data.players;
    }
  );
};