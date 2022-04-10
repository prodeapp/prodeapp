import {useQuery} from "react-query";
import {Tournament} from "../lib/types";
import {tournaments} from "../dummy-subgraph";

export const useTournaments = () => {
  return useQuery<Tournament[], Error>(
    ['useTournaments'],
    async () => {
      // TODO: load from subgraph

      return tournaments;
    },
  );
};