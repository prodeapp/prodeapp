import {useQuery} from "react-query";
import {Match} from "../lib/types";
import {matches} from "../dummy-subgraph";

export const useMatches = (tournamentId: string) => {
  return useQuery<Match[], Error>(
    ['useMatches', tournamentId],
    async () => {
      // TODO: load from subgraph

      return matches;
    },
  );
};