import { useQuery } from "@tanstack/react-query";
import {Event, EVENT_FIELDS} from "../graphql/subgraph";
import {apolloProdeQuery} from "../lib/apolloClient";
import {useMemo} from "react";

const query = `
    ${EVENT_FIELDS}
    query EventsQuery ($marketId: String!){
      events(where:{market: $marketId}, orderBy: openingTs, orderDirection: asc) {
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

export type IndexedEvents = Record<string, Event>;

export function getIndexedEvents(events: Event[]): IndexedEvents {
  return events.reduce((obj, event) => {
    return {...obj, [event.id]: event}
  }, {})
}

export function useIndexedEvents(events?: Event[]) {
  return useMemo(() => getIndexedEvents(events || []), [events])
}