import {Event} from "../graphql/subgraph";
import {DecodedCurateListFields} from "./curate";
import {getSingleEliminationMatches} from "./brackets";
import {useIndexedEvents} from "../hooks/useEvents";
import {FORMAT_SINGLE_ELIMINATION} from "./curate";

export function useFormatMatches({events, itemJson}: {events: Event[] | undefined, itemJson: DecodedCurateListFields['Details'] | null}) {
  const indexedEvents = useIndexedEvents(events);
  return Object.keys(indexedEvents).length > 0 && itemJson &&
    itemJson.formats.map((format: any, i: number) => {
      const interdependencies: { [key: string]: Array<string> } = {};
      try {
        if (format.type === FORMAT_SINGLE_ELIMINATION) {
          const matches = getSingleEliminationMatches(format.questions.map((event: string) => indexedEvents[event]));
          const start = ~~((matches.length / 2) + 0.5);
          for (let i = start; i < matches.length; i++) {
            if (i === start * 2 - 1) {
              // third place match
              const previousMatchId = (i - start - 3) * 2;
              interdependencies[matches[i].id] = [
                matches[previousMatchId].id as string, 
                matches[previousMatchId + 1].id as string, 
                matches[previousMatchId + 2].id as string, 
                matches[previousMatchId + 3].id as string
              ];
            } else {
              const previousMatchId = (i - start) * 2;
              interdependencies[matches[i].id] = [
                matches[previousMatchId].id as string, 
                matches[previousMatchId + 1].id as string
              ];
            }
          }
          return interdependencies;
        } else {
          return interdependencies;
        }
      } catch {
        return interdependencies;
      }
    });
}