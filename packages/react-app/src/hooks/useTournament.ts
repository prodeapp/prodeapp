import {useQuery} from "react-query";
import {Tournament} from "../lib/types";
import {tournaments} from "../dummy-subgraph";

export const useTournament = (id: number) => {
  return useQuery<Tournament, Error>(
    ['useTournament', id],
    async () => {
      // TODO: load from subgraph

      const tournament = tournaments.find(tournament => tournament.id.eq(id));

      if (!tournament) {
        throw new Error('Tournament not found');
      }

      return tournament;
    },
  );
};