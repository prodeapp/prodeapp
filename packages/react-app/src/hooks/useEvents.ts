import { useQuery } from "react-query";
import {Event, EVENT_FIELDS} from "../graphql/subgraph";
import {apolloProdeQuery} from "../lib/apolloClient";

const query = `
    ${EVENT_FIELDS}
    query EventsQuery ($marketId: String!){
      events(where:{market: $marketId}, orderBy: nonce, orderDirection: asc) {
        ...EventFields
      }
    }
`;

export const fetchEvents = async (marketId: string) => {
  const response = await apolloProdeQuery<{ events: Event[] }>(query, {marketId});

  if (!response) throw new Error("No response from TheGraph");

  return response.data.events;
};

export const useEvents = (marketId: string) => {
  return useQuery<Event[], Error>(
    ["useEvents", marketId],
    async () => {
      return fetchEvents(marketId);
    }
  );
};