import { useQuery } from "@tanstack/react-query";
import {Event, EVENT_FIELDS} from "../graphql/subgraph";
import {apolloProdeQuery} from "../lib/apolloClient";
import {useMemo} from "react";
import {indexObjectsByKey} from "../lib/helpers";

const query = `
    ${EVENT_FIELDS}
    query EventsQuery ($marketId: String!, $orderBy: String!, $orderDirection: String!){
      events(where:{market: $marketId}, orderBy: $orderBy, orderDirection: $orderDirection) {
        ...EventFields
      }
    }
`;

export const fetchEvents = async (marketId: string, orderBy: string = 'openingTs', orderDirection: string = 'asc') => {
  const response = await apolloProdeQuery<{ events: Event[] }>(query, {marketId, orderBy, orderDirection});

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

export const useEventsToBet = (marketId: string) => {
  return useQuery<Event[], Error>(
    ["useEventsToBet", marketId],
    async () => {
      /**
       * ================================================================
       * THIS HOOK IS USED TO BUILD THE DATA SENT TO Market.placeBet()
       * AND IT IS REQUIRED TO HAVE orderBy = 'nonce' AND orderDirection = 'asc'
       * OTHERWISE THE BETS WILL BE SENT IN INCORRECT ORDER
       * ================================================================
       */
      return fetchEvents(marketId, 'nonce', 'asc');
    }
  );
};

export function useIndexedEvents(events?: Event[]) {
  return useMemo(() => indexObjectsByKey(events || [], 'id'), [events])
}