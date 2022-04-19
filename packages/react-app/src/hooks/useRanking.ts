import {Tournament, BET_FIELDS} from "../graphql/subgraph";
import { gql, useQuery } from "@apollo/client";

const query = gql`
    ${BET_FIELDS}
    query PLAYERSQuery ($tournamentID: String!){
      tournaments(where:{id: $tournamentID}) {
        bets{...BetsFields}
      }
    }
`;

/** TODO: sort the bets by points */
export const useRanking = (tournamentId: string) => {
  const {loading, error, data} = useQuery<{tournamnet: Tournament}>(query, {
    variables: {tournamentID: tournamentId}});

  return {loading, error, ranking: data?.tournamnet.bets || []}
};