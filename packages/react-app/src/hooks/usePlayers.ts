import {Player, PLAYER_FIELDS} from "../graphql/subgraph";
import { gql, useQuery } from "@apollo/client";

const query = gql`
    ${PLAYER_FIELDS}
    query PLAYERQuery ($id: String!){
      players(where:{id: $id} {
        ...PlayerFields
      }
    }
`;
export const usePlayer = (playerID: string) => {
  const {loading, error, data} = useQuery<{player: Player[]}>(query, {
    variables: {id: playerID}});
  return {loading, error, player: data?.player || []}
};