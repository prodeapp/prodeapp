import {Event, Market} from "../graphql/subgraph";
import {useEffect, useState} from "react";
import {useEvents, useIndexedEvents} from "./useEvents";
import {useCurateItemJson} from "./useCurateItems";
import {
  convertExtraDataGroups,
  DecodedCurateListFields,
  FORMAT_DOUBLE_ELIMINATION,
  FORMAT_GROUPS,
  FORMAT_GSL,
  FORMAT_SINGLE_ELIMINATION
} from "../lib/curate";
import {getEliminationConfig, parseEliminationConfig} from "../lib/brackets";

export type GroupedEvents = {title: string, events: Event[]};

const useCuratedGroupedEvents = (events: Event[], itemJson: DecodedCurateListFields['Details'] | null): GroupedEvents[] => {
  const [groupedEvents, setGroupedEvents] = useState<GroupedEvents[]>([]);
  const indexedEvents = useIndexedEvents(events);

  useEffect(() => {
    const _groupedEvents: GroupedEvents[] = [];

    if (itemJson !== null && Object.keys(indexedEvents).length > 0) {
      itemJson.formats.forEach((format: any) => {

        const _events = format.questions.map((event: string) => indexedEvents[event]);

        if (format.type === FORMAT_GROUPS) {
          const parsedConfig = parseEliminationConfig(_events, format.extraData);

          parsedConfig.forEach((group, i) => {
            _groupedEvents.push({title: group.name || `Group ${i+1}`, events: group.events});
          })
        } else if (format.type === FORMAT_GSL) {
          // TODO
          _groupedEvents.push({title: format.type, events: _events});
        } else if (format.type === FORMAT_SINGLE_ELIMINATION) {
          const bracketConfig = parseEliminationConfig(_events, convertExtraDataGroups(getEliminationConfig(_events.length, ['Final', 'Semifinals', 'Quarterfinals'], 'Round of %', true)))

          bracketConfig.forEach(data => {
            _groupedEvents.push({title: data.name, events: data.events});
          })
        } else if (format.type === FORMAT_DOUBLE_ELIMINATION) {
          // TODO
          _groupedEvents.push({title: format.type, events: _events});
        }
      })
    }

    setGroupedEvents(_groupedEvents)
  }, [events, itemJson, indexedEvents]);

  return groupedEvents;
}

export const useGroupedEvents = (market: Market): GroupedEvents[] => {
  const [groupedEvents, setGroupedEvents] = useState<GroupedEvents[]>([]);
  const { isLoading, error, data: events } = useEvents(market.id);
  const itemJson = useCurateItemJson(market.hash);

  const curatedGroupedEvents = useCuratedGroupedEvents(events || [], itemJson);

  useEffect(() => {
    if (curatedGroupedEvents.length > 0) {
      // verified market
      setGroupedEvents(curatedGroupedEvents);
    } else if (!isLoading && !error) {
      // unverified market
      setGroupedEvents([{title: '', events}]);
    }
  }, [isLoading, error, events, curatedGroupedEvents]);

  return groupedEvents;
};