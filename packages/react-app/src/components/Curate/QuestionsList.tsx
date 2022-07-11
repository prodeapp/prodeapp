import * as React from 'react';
import {Event} from "../../graphql/subgraph";
import {UseFieldArrayReturn, useFormContext, useWatch} from "react-hook-form";
import {DragDropContext, Droppable, Draggable, DropResult} from "react-beautiful-dnd";
import {FORMAT_DOUBLE_ELIMINATION, FORMAT_GROUPS, FORMAT_SINGLE_ELIMINATION} from "../../lib/curate";
import {CurateSubmitFormValues, ExtraDataGroups} from "./index";
import {useEffect, useMemo, useState} from "react";
import Alert from "@mui/material/Alert";
import { Trans } from '@lingui/macro';

export interface Props {
  useFieldArrayReturn: UseFieldArrayReturn<CurateSubmitFormValues, 'questions'>
  events: Event[]
}

function GroupsPreview({questions, config}: {questions: string[], config: ExtraDataGroups}) {
  const [sizeCount, setSizeCount] = useState(0);

  useEffect(() => {
    setSizeCount(
      config.groups.map((group) => Number(group.size)).reduce((partialSum, a) => partialSum + a, 0)
    );
  }, [config]);

  if (sizeCount !== questions.length) {
    return <Alert severity="error"><Trans>The sum of group sizes must be equal to the amount of events</Trans>.</Alert>
  }

  let t = 0;

  return <>{config.groups.map((group, i) => {
    return <div style={{border: '1px solid #fff', padding: '5px', marginBottom: '10px'}} key={i}>
      <div>{group.name || `Group ${i+1}`}</div>
      <div style={{padding: '5px 10px'}}>
        {Array.from({length: group.size}, (_, i) => i + 1).map(j => {
          const n = t++;
          if (!questions[n]) {
            return null
          }
          return <div style={{padding: '5px 0'}} key={j}>{questions[n]}</div>
        })}
      </div>
    </div>
  })}</>
}

function EliminationPreview({questions, type}: {questions: string[], type: 'single'|'double'}) {
  const getConfig = (totalEvents: number, mainRoundNames: string[] = [], altRoundNames: string = 'Round of %', addThirdPlace: boolean = false): ExtraDataGroups => {
    let n = 0;
    let accumEvents = Math.pow(2, n);
    let currentEvents = accumEvents;

    const config: ExtraDataGroups = {groups: [], rounds: 1};

    while(accumEvents <= totalEvents) {
      config.groups.unshift({size: currentEvents, name: mainRoundNames[n] || `${altRoundNames.replace('%', String(currentEvents * 2))}`});

      if (totalEvents === 2) {
        break;
      }

      if (addThirdPlace && (accumEvents + 1) === totalEvents) {
        // third place match
        config.groups.push({size: 1, name: 'Third place'})
      }

      n++;
      currentEvents = Math.pow(2, n);
      accumEvents += currentEvents;
    }

    return config;
  }

  if (type === 'single') {
    return <GroupsPreview
            questions={questions}
            config={getConfig(questions.length, ['Final', 'Semifinals', 'Quarterfinals'], '', true)} />
  }

  const singleMatchFinal = questions.length % 2 === 0;
  const totalTeams = singleMatchFinal ? ((questions.length + 2) / 2) : ((questions.length + 1) / 2);

  if (Math.log2(totalTeams) % 1 !== 0) {
    return <Alert severity="error"><Trans>Double elimination tournaments must have a quantity of teams power of 2</Trans>.</Alert>
  }

  const questionsCopy = [...questions];

  const brackets = [];

  // winners bracket
  brackets.push(
    {
      questions: questionsCopy.splice(0, totalTeams - 1),
      config: getConfig(totalTeams - 1, ['Winners Final', 'Winners Semifinals', 'Winners Quarterfinals'], 'Winners Round of %')
    }
  );

  // final match 1
  brackets.push(
    {questions: questionsCopy.splice(0, 1), config: getConfig(1, [], 'Final #1')}
  );

  if (!singleMatchFinal) {
    // final match 2
    brackets.push(
      {questions: questionsCopy.splice(0, 1), config: getConfig(1, [], 'Final #2')}
    );
  }

  // losers bracket
  const totalLosersTeams = totalTeams / 2;
  const losersConfig = getConfig(totalLosersTeams, ['Losers Final #1', 'Losers Semifinals #1', 'Losers Quarterfinals #1'], 'Losers Round of % #1');

  const loserGroups: ExtraDataGroups['groups'] = [];

  losersConfig.groups.forEach((group) => {
    loserGroups.push(group);

    const tmp = Object.assign({}, group);
    tmp.name = tmp.name.replace('#1', '#2');
    loserGroups.push(tmp);
  });

  losersConfig.groups = loserGroups;

  brackets.push(
    {questions: questionsCopy, config: losersConfig}
  );

  return <>
    {brackets.map((bracket, i) => <GroupsPreview questions={bracket.questions} config={bracket.config} key={i} />)}
  </>
}

export default function QuestionsList({useFieldArrayReturn, events}: Props) {
  const { control } = useFormContext<CurateSubmitFormValues>();

  const indexedEvents: Record<string, Event> = useMemo(() => {
    return events.reduce((obj, event) => {
      return {...obj, [event.id]: event}
    }, {})
  }, [events]);

  const format = useWatch({control, name: 'format'});
  const extraDataGroups = useWatch({control, name: 'extraDataGroups'});

  const handleFieldDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) {
      return;
    }
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    useFieldArrayReturn.move(source.index, destination.index);
  }

  return <div style={{display: 'flex'}}>
    <div style={{width: format === FORMAT_GROUPS || format === FORMAT_SINGLE_ELIMINATION ? '50%' : '100%'}}>
      <h3 style={{marginBottom: '30px'}}><Trans>Drag and drop each question to the correct position</Trans></h3>
      <DragDropContext onDragEnd={handleFieldDragEnd}>
        <Droppable droppableId="panel-dropzone">
          {provided => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="panels-wrapper"
            >
              {useFieldArrayReturn.fields.map((field, index) => (
                <Draggable draggableId={field.id} index={index} key={field.id}>
                  {provided => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="panel"
                    >
                      <div style={{padding: '5px 0'}}>{indexedEvents[field.value].title}</div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
    {format === FORMAT_GROUPS && <div style={{width: '50%'}}>
      <h3 style={{marginBottom: '30px'}}><Trans>Groups preview</Trans></h3>
      <GroupsPreview questions={useFieldArrayReturn.fields.map(f => indexedEvents[f.value].title)} config={extraDataGroups} />
    </div>}
    {format === FORMAT_SINGLE_ELIMINATION && <div style={{width: '50%'}}>
      <h3 style={{marginBottom: '30px'}}><Trans>Single-Elimination preview</Trans></h3>
      <EliminationPreview questions={useFieldArrayReturn.fields.map(f => indexedEvents[f.value].title)} type="single" />
    </div>}
    {format === FORMAT_DOUBLE_ELIMINATION && <div style={{width: '50%'}}>
      <h3 style={{marginBottom: '30px'}}><Trans>Double-Elimination preview</Trans></h3>
      <EliminationPreview questions={useFieldArrayReturn.fields.map(f => indexedEvents[f.value].title)} type="double"/>
    </div>}
  </div>
}