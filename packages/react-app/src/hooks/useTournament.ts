import {Tournament, TOURNAMENT_FIELDS} from "../graphql/subgraph";
import {useQuery} from "@apollo/client/react/hooks/useQuery";
import {gql} from "@apollo/client";

const query = gql`
    ${TOURNAMENT_FIELDS}
    query TournamentQuery($id: String) {
        tournament(id: $id) {
            ...TournamentFields
        }
    }
`;

export const useTournament = (id: string) => {
  const {loading, error, data} = useQuery<{tournament: Tournament}, {id: string}>(query, {variables: {id}});

  return {loading, error, tournament: data?.tournament || undefined}
};