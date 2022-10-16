import {INVALID_RESULT, REALITY_TEMPLATE_MULTIPLE_SELECT} from "../../lib/reality";
import {t, Trans} from "@lingui/macro";
import {MenuItem, Select} from "@mui/material";
import {transOutcome} from "../../lib/helpers";
import React, {useEffect, useState} from "react";
import {Market, Event} from "../../graphql/subgraph";
import {
  getInverseInterdependencies,
  MatchesInterdependencies,
  useMatchesInterdependencies
} from "../../hooks/useMatchesInterdependencies";
import {BetFormValues} from "./BetForm";
import {DecodedCurateListFields, fetchCurateItemsByHash, getDecodedParams} from "../../lib/curate";
import {UseFormSetValue, UseFormRegister} from "react-hook-form/dist/types/form";
import {FieldErrors} from "react-hook-form/dist/types/errors";

type BetOutcomeValue = number | typeof INVALID_RESULT;

type IndexedBetOutcome = {value: BetOutcomeValue, text: string};

function getOutcomes(event: Event, events: Event[], outcomesValues: BetFormValues['outcomes'], matchesInterdependencies: MatchesInterdependencies): IndexedBetOutcome[] {
  // first map and then filter to keep the index of each outcome as value
  let outcomes: IndexedBetOutcome[] =  event.outcomes.map((outcome, i) => ({value: i, text: outcome}))

  return filterOutcomesInterdependencies(outcomes, event, events, outcomesValues, matchesInterdependencies);
}

function filterOutcomesInterdependencies(outcomes: IndexedBetOutcome[], event: Event, events: Event[], outcomesValues: BetFormValues['outcomes'], matchesInterdependencies: MatchesInterdependencies): IndexedBetOutcome[] {
  return outcomes.filter(outcome => {
    if (matchesInterdependencies) {
      const relatedQuestions: string[] = matchesInterdependencies[event.id] ?? [];
      const possibleOutcomes: string[] = [];
      for (let k = 0; k < relatedQuestions.length; k++) {
        const questionId = relatedQuestions[k];
        const questionPos = events.findIndex(event => event.id === questionId);
        const userSelectionIndex = outcomesValues[questionPos].value;
        if (userSelectionIndex !== "") {
          const outcomeSelected = events[questionPos].outcomes[Number(userSelectionIndex)];
          possibleOutcomes.push(outcomeSelected);
        }
      }
      if (possibleOutcomes.length >= 2 && !possibleOutcomes.includes(outcome.text)) {
        return false;
      }
    }

    return true;
  })
}

interface Props {
  market: Market
  events: Event[]
  i: number
  outcomes: BetFormValues['outcomes']
  register: UseFormRegister<BetFormValues>
  errors: FieldErrors<BetFormValues>
  setValue: UseFormSetValue<BetFormValues>
}

export function BetOutcomeSelect({market, events, i, outcomes, register, errors, setValue}: Props) {

  const [itemJson, setItemJson] = useState<DecodedCurateListFields['Details'] | null>(null);

  const matchesInterdependencies = useMatchesInterdependencies({events: events, itemJson: itemJson});
  const inverseInterdependencies = getInverseInterdependencies(matchesInterdependencies);

  useEffect(() => {
    (async () => {
      const curateItems = await fetchCurateItemsByHash(market.hash);

      if (curateItems.length > 0) {
        const itemProps = await getDecodedParams(curateItems[0].id)
        setItemJson(itemProps.Details)
      }
    })();
  }, [market]);

  const onOutcomeChange = () => {
    inverseInterdependencies[events[i].id].forEach(matchDependencyId => {
      const matchDependencyIndex = outcomes.findIndex(outcome => outcome.questionId === matchDependencyId);
      if (outcomes[matchDependencyIndex].value !== '') {
        setValue(`outcomes.${matchDependencyIndex}.value`, '', {shouldTouch: true});
      }
    })
  }

  return <Select
    defaultValue={events[i].templateID === REALITY_TEMPLATE_MULTIPLE_SELECT ? [] : ""}
    id={`event-${i}-outcome-select`}
    multiple={events[i].templateID === REALITY_TEMPLATE_MULTIPLE_SELECT}
    {...register(`outcomes.${i}.value`, {required: t`This field is required`})}
    error={!!errors.outcomes?.[i]?.value}
    onChange={onOutcomeChange}
  >
    {getOutcomes(events[i], events, outcomes, matchesInterdependencies).map(outcome => <MenuItem value={outcome.value} key={outcome.value}>{transOutcome(outcome.text)}</MenuItem>)}
    <MenuItem value={INVALID_RESULT}><Trans>Invalid result</Trans></MenuItem>
  </Select>
}