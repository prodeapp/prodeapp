import { useQuery } from "@apollo/client";
import {Tournament, TOURNAMENT_FIELDS} from "../graphql/subgraph";
import { gql } from "@apollo/client";

const query = gql`
    ${TOURNAMENT_FIELDS}
    query TournamentsQuery {
      tournaments(first: 10) {
        ...TournamentFields
      }
    }
`;

export const useTournaments = () => {
  const {loading, error, data} = useQuery<{tournaments: Tournament[]}>(query);

  return {loading, error, tournaments: data?.tournaments || []}
};