import {useQuery} from "react-query";
import {Ranking} from "../lib/types";
import {ranking} from "../dummy-subgraph";

export const useRanking = (tournamentId: number) => {
  return useQuery<Ranking[], Error>(
    ['useRanking', tournamentId],
    async () => {
      // TODO: load from subgraph

      return ranking;
    },
  );
};